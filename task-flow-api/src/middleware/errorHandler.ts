import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types';
import config from '@/config';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.code = 'VALIDATION_ERROR';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.code = 'AUTHENTICATION_ERROR';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.code = 'AUTHORIZATION_ERROR';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.code = 'NOT_FOUND_ERROR';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    this.code = 'CONFLICT_ERROR';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
    this.code = 'RATE_LIMIT_ERROR';
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error') {
    super(message, 502);
    this.code = 'EXTERNAL_SERVICE_ERROR';
  }
}

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Main error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new NotFoundError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message).join(', ');
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AuthenticationError(message);
  }

  // Supabase errors
  if (err.code === 'PGRST301') {
    error = new NotFoundError('Resource not found');
  }

  if (err.code === '23505') {
    error = new ConflictError('Resource already exists');
  }

  if (err.code === '23503') {
    error = new ValidationError('Invalid reference');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ValidationError('File too large');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new ValidationError('Unexpected file field');
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error = new AppError('Internal server error', 500);
  }

  const response: ApiResponse = {
    success: false,
    error: error.message || 'Internal server error',
  };

  // Add error code if available
  if (error.code) {
    response.error = {
      message: error.message,
      code: error.code,
    };
  }

  // Add stack trace in development
  if (config.server.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  return res.status(error.statusCode || 500).json(response);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): Response => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.originalUrl} not found`,
  };

  return res.status(404).json(response);
};

// Success response helper
export const successResponse = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };

  return res.status(statusCode).json(response);
};

// Paginated response helper
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
): Response => {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const response = {
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };

  return res.status(200).json(response);
};