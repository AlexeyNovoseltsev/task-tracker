import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/config/supabase';
import { AuthUser } from '@/types';
import { AuthenticationError, AuthorizationError } from './errorHandler';
import config from '@/config';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// JWT payload interface
interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Extract token from request
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
};

// Verify JWT token
const verifyJWT = (token: string): Promise<JWTPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as JWTPayload);
      }
    });
  });
};

// Main authentication middleware
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip auth for certain routes
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/health',
      '/health'
    ];
    
    if (publicRoutes.includes(req.path)) {
      return next();
    }

    const token = extractToken(req);
    
    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    // Verify JWT token
    const decoded = await verifyJWT(token);
    
    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      throw new AuthenticationError('Invalid token');
    }

    // Update last active timestamp
    await supabaseAdmin
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id);

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication middleware (doesn't throw on missing token)
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next();
    }

    const decoded = await verifyJWT(token);
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (!error && user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url,
      };
    }

    next();
  } catch (error) {
    // Ignore auth errors in optional middleware
    next();
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      throw new AuthorizationError('Insufficient permissions');
    }

    next();
  };
};

// Project membership middleware
export const requireProjectMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const projectId = req.params.projectId || req.body.project_id;
    
    if (!projectId) {
      throw new AuthorizationError('Project ID is required');
    }

    // Check if user is a member of the project
    const { data: membership, error } = await supabaseAdmin
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !membership) {
      throw new AuthorizationError('Access denied to this project');
    }

    // Attach membership role to request
    req.projectRole = membership.role;

    next();
  } catch (error) {
    next(error);
  }
};

// Project admin middleware
export const requireProjectAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const projectId = req.params.projectId || req.body.project_id;
    
    if (!projectId) {
      throw new AuthorizationError('Project ID is required');
    }

    // Check if user is admin/owner of the project
    const { data: membership, error } = await supabaseAdmin
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !membership) {
      throw new AuthorizationError('Access denied to this project');
    }

    if (!['owner', 'admin'].includes(membership.role)) {
      throw new AuthorizationError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Resource ownership middleware
export const requireResourceOwnership = (resourceType: 'task' | 'comment' | 'project') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const resourceId = req.params.id;
      
      if (!resourceId) {
        throw new AuthorizationError('Resource ID is required');
      }

      let ownerField: string;
      let tableName: string;

      switch (resourceType) {
        case 'task':
          tableName = 'tasks';
          ownerField = 'reporter_id';
          break;
        case 'comment':
          tableName = 'comments';
          ownerField = 'author_id';
          break;
        case 'project':
          tableName = 'projects';
          ownerField = 'owner_id';
          break;
        default:
          throw new Error('Invalid resource type');
      }

      const { data: resource, error } = await supabaseAdmin
        .from(tableName)
        .select(ownerField)
        .eq('id', resourceId)
        .single();

      if (error || !resource) {
        throw new AuthorizationError('Resource not found');
      }

      if (resource[ownerField] !== req.user.id) {
        throw new AuthorizationError('Access denied to this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Generate JWT token
export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
    }
  );
};

// Generate refresh token
export const generateRefreshToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      type: 'refresh',
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
    }
  );
};

// Extend Request interface to include project role
declare global {
  namespace Express {
    interface Request {
      projectRole?: string;
    }
  }
}