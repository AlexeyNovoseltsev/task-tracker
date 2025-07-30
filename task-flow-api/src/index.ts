import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';

import config from '@/config';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/logger';
import { authMiddleware } from '@/middleware/auth';
import { validationErrorHandler } from '@/middleware/validation';

// Route imports
import authRoutes from '@/routes/auth';
import projectRoutes from '@/routes/projects';
import taskRoutes from '@/routes/tasks';
import sprintRoutes from '@/routes/sprints';
import commentRoutes from '@/routes/comments';
import attachmentRoutes from '@/routes/attachments';
import userRoutes from '@/routes/users';
import analyticsRoutes from '@/routes/analytics';
import healthRoutes from '@/routes/health';

// WebSocket handler
import { initializeWebSocket } from '@/services/websocket';

// Create Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: config.websocket.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Initialize WebSocket handlers
initializeWebSocket(io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.supabase.url],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      config.server.corsOrigin,
      'http://localhost:1420',
      'http://127.0.0.1:1420',
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and internal requests
    return req.path === '/health' || req.path === '/api/health';
  },
});

app.use(limiter);

// Request logging
app.use(requestLogger);

// Health check endpoint (before auth)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Authentication middleware for protected routes
app.use('/api', authMiddleware);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Validation error handler
app.use(validationErrorHandler);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Add Socket.IO instance to app for use in routes
app.set('io', io);

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('Server closed successfully');
    
    // Close database connections if needed
    // Close other resources...
    
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, log the error instead
  if (config.server.nodeEnv === 'production') {
    // Log to monitoring service
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Exit gracefully
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Start server
const startServer = async () => {
  try {
    // Perform any async initialization here
    // e.g., database connection checks, external service health checks
    
    server.listen(config.server.port, config.server.host, () => {
      console.log(`
🚀 TaskFlow Pro API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server:     http://${config.server.host}:${config.server.port}
🌍 Environment: ${config.server.nodeEnv}
🔗 CORS Origin: ${config.server.corsOrigin}
🔌 WebSocket:   Enabled
🛡️  Security:   Helmet + CORS + Rate Limiting
📊 Monitoring:  ${config.monitoring.enabled ? 'Enabled' : 'Disabled'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
      
      // Log configuration warnings in development
      if (config.server.nodeEnv === 'development') {
        if (!process.env.SUPABASE_URL) {
          console.warn('⚠️  Warning: SUPABASE_URL not set');
        }
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key') {
          console.warn('⚠️  Warning: Using default JWT_SECRET (not secure for production)');
        }
      }
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export { app, server, io };