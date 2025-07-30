import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/config/supabase';
import config from '@/config';
import { wsLogger } from '@/middleware/logger';
import {
  SocketEvent,
  TaskUpdatedEvent,
  CommentAddedEvent,
  ProjectUpdatedEvent,
  UserJoinedEvent,
  AuthUser,
} from '@/types';

// Connected users map
const connectedUsers = new Map<string, {
  socket: Socket;
  user: AuthUser;
  joinedAt: Date;
  lastActivity: Date;
}>();

// User to socket mapping
const userSockets = new Map<string, Set<string>>();

// Project rooms
const projectRooms = new Map<string, Set<string>>();

// Socket authentication middleware
const authenticateSocket = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return next(new Error('Invalid authentication token'));
    }

    // Attach user to socket
    socket.data.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
    };

    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

// Initialize WebSocket server
export const initializeWebSocket = (io: SocketIOServer): void => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as AuthUser;
    
    wsLogger.connection(socket.id, user.id);

    // Store connected user
    connectedUsers.set(socket.id, {
      socket,
      user,
      joinedAt: new Date(),
      lastActivity: new Date(),
    });

    // Add to user sockets mapping
    if (!userSockets.has(user.id)) {
      userSockets.set(user.id, new Set());
    }
    userSockets.get(user.id)!.add(socket.id);

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to TaskFlow Pro',
      user: user,
      timestamp: new Date().toISOString(),
    });

    // Handle joining project rooms
    socket.on('join:project', async (projectId: string) => {
      try {
        // Verify user has access to project
        const { data: membership, error } = await supabaseAdmin
          .from('project_members')
          .select('role')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .single();

        if (error || !membership) {
          socket.emit('error', {
            message: 'Access denied to project',
            code: 'ACCESS_DENIED',
          });
          return;
        }

        // Join project room
        socket.join(`project:${projectId}`);
        
        // Track project room membership
        if (!projectRooms.has(projectId)) {
          projectRooms.set(projectId, new Set());
        }
        projectRooms.get(projectId)!.add(socket.id);

        wsLogger.message('join:project', socket.id, user.id, `project:${projectId}`);

        // Notify project members
        const joinEvent: UserJoinedEvent = {
          type: 'user:joined',
          payload: {
            user,
            project_id: projectId,
          },
          room: `project:${projectId}`,
          user_id: user.id,
          timestamp: new Date().toISOString(),
        };

        socket.to(`project:${projectId}`).emit('user:joined', joinEvent);
        
        socket.emit('joined:project', {
          projectId,
          message: 'Joined project room',
          timestamp: new Date().toISOString(),
        });

      } catch (error) {
        wsLogger.error(error, socket.id, user.id);
        socket.emit('error', {
          message: 'Failed to join project room',
          code: 'JOIN_PROJECT_ERROR',
        });
      }
    });

    // Handle leaving project rooms
    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      
      // Remove from project room tracking
      if (projectRooms.has(projectId)) {
        projectRooms.get(projectId)!.delete(socket.id);
        if (projectRooms.get(projectId)!.size === 0) {
          projectRooms.delete(projectId);
        }
      }

      wsLogger.message('leave:project', socket.id, user.id, `project:${projectId}`);

      socket.emit('left:project', {
        projectId,
        message: 'Left project room',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle task subscriptions
    socket.on('subscribe:task', (taskId: string) => {
      socket.join(`task:${taskId}`);
      wsLogger.message('subscribe:task', socket.id, user.id, `task:${taskId}`);
    });

    socket.on('unsubscribe:task', (taskId: string) => {
      socket.leave(`task:${taskId}`);
      wsLogger.message('unsubscribe:task', socket.id, user.id, `task:${taskId}`);
    });

    // Handle typing indicators
    socket.on('typing:start', (data: { taskId: string; commentId?: string }) => {
      socket.to(`task:${data.taskId}`).emit('typing:start', {
        user,
        taskId: data.taskId,
        commentId: data.commentId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('typing:stop', (data: { taskId: string; commentId?: string }) => {
      socket.to(`task:${data.taskId}`).emit('typing:stop', {
        user,
        taskId: data.taskId,
        commentId: data.commentId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle user presence updates
    socket.on('presence:update', (status: 'online' | 'away' | 'busy') => {
      // Update user status in all project rooms
      socket.rooms.forEach(room => {
        if (room.startsWith('project:')) {
          socket.to(room).emit('presence:update', {
            user,
            status,
            timestamp: new Date().toISOString(),
          });
        }
      });
    });

    // Handle activity updates
    socket.on('activity:heartbeat', () => {
      const connection = connectedUsers.get(socket.id);
      if (connection) {
        connection.lastActivity = new Date();
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      wsLogger.disconnection(socket.id, user.id, reason);

      // Remove from connected users
      connectedUsers.delete(socket.id);

      // Remove from user sockets mapping
      const userSocketSet = userSockets.get(user.id);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          userSockets.delete(user.id);
        }
      }

      // Remove from project rooms
      projectRooms.forEach((sockets, projectId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            projectRooms.delete(projectId);
          }
        }
      });

      // Notify project rooms about user leaving
      socket.rooms.forEach(room => {
        if (room.startsWith('project:')) {
          socket.to(room).emit('user:left', {
            user,
            reason,
            timestamp: new Date().toISOString(),
          });
        }
      });
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      wsLogger.error(error, socket.id, user.id);
    });
  });

  // Connection monitoring
  setInterval(() => {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    connectedUsers.forEach((connection, socketId) => {
      const inactiveTime = now.getTime() - connection.lastActivity.getTime();
      
      if (inactiveTime > inactiveThreshold) {
        connection.socket.emit('ping');
      }
    });
  }, 60000); // Check every minute
};

// Broadcast functions for use in API routes
export const broadcastToProject = (io: SocketIOServer, projectId: string, event: SocketEvent): void => {
  io.to(`project:${projectId}`).emit(event.type, event);
  wsLogger.message(`broadcast:${event.type}`, 'server', undefined, `project:${projectId}`);
};

export const broadcastToTask = (io: SocketIOServer, taskId: string, event: SocketEvent): void => {
  io.to(`task:${taskId}`).emit(event.type, event);
  wsLogger.message(`broadcast:${event.type}`, 'server', undefined, `task:${taskId}`);
};

export const broadcastToUser = (io: SocketIOServer, userId: string, event: SocketEvent): void => {
  const userSocketSet = userSockets.get(userId);
  if (userSocketSet) {
    userSocketSet.forEach(socketId => {
      const connection = connectedUsers.get(socketId);
      if (connection) {
        connection.socket.emit(event.type, event);
      }
    });
    wsLogger.message(`broadcast:${event.type}`, 'server', userId);
  }
};

// Broadcast task updates
export const broadcastTaskUpdate = (io: SocketIOServer, taskId: string, projectId: string, task: any, changes: any): void => {
  const event: TaskUpdatedEvent = {
    type: 'task:updated',
    payload: {
      task,
      changes,
    },
    room: `project:${projectId}`,
    timestamp: new Date().toISOString(),
  };

  broadcastToProject(io, projectId, event);
  broadcastToTask(io, taskId, event);
};

// Broadcast comment added
export const broadcastCommentAdded = (io: SocketIOServer, comment: any, taskId: string, projectId: string): void => {
  const event: CommentAddedEvent = {
    type: 'comment:added',
    payload: {
      comment,
      task_id: taskId,
    },
    room: `project:${projectId}`,
    timestamp: new Date().toISOString(),
  };

  broadcastToProject(io, projectId, event);
  broadcastToTask(io, taskId, event);
};

// Broadcast project updates
export const broadcastProjectUpdate = (io: SocketIOServer, projectId: string, project: any): void => {
  const event: ProjectUpdatedEvent = {
    type: 'project:updated',
    payload: {
      project,
    },
    room: `project:${projectId}`,
    timestamp: new Date().toISOString(),
  };

  broadcastToProject(io, projectId, event);
};

// Get online users for a project
export const getOnlineUsersForProject = (projectId: string): AuthUser[] => {
  const onlineUsers: AuthUser[] = [];
  const projectSocketSet = projectRooms.get(projectId);
  
  if (projectSocketSet) {
    projectSocketSet.forEach(socketId => {
      const connection = connectedUsers.get(socketId);
      if (connection) {
        onlineUsers.push(connection.user);
      }
    });
  }
  
  return onlineUsers;
};

// Get connection statistics
export const getConnectionStats = () => {
  return {
    totalConnections: connectedUsers.size,
    uniqueUsers: userSockets.size,
    projectRooms: projectRooms.size,
    connections: Array.from(connectedUsers.values()).map(conn => ({
      userId: conn.user.id,
      userName: conn.user.name,
      joinedAt: conn.joinedAt,
      lastActivity: conn.lastActivity,
    })),
  };
};