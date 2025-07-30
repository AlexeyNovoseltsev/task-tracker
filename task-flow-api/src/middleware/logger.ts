import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import config from '@/config';

// Create Winston logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
  defaultMeta: { service: 'taskflow-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: config.logging.filePath,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

// Add console transport in development
if (config.server.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Skip logging for health checks and static files
  const skipPaths = ['/health', '/favicon.ico', '/robots.txt'];
  const shouldSkip = skipPaths.some(path => req.path.startsWith(path));
  
  if (shouldSkip) {
    return next();
  }

  // Log request
  const requestLog = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentLength: req.get('Content-Length'),
    timestamp: new Date().toISOString(),
    userId: req.user?.id,
    requestId: req.get('X-Request-ID') || generateRequestId(),
  };

  logger.info('Incoming request', requestLog);

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data: any) {
    const responseTime = Date.now() - startTime;
    
    const responseLog = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userId: req.user?.id,
      requestId: requestLog.requestId,
      success: res.statusCode < 400,
    };

    // Log different levels based on status code
    if (res.statusCode >= 500) {
      logger.error('Server error response', { ...responseLog, data });
    } else if (res.statusCode >= 400) {
      logger.warn('Client error response', { ...responseLog, error: data.error });
    } else {
      logger.info('Successful response', responseLog);
    }

    return originalJson.call(this, data);
  };

  next();
};

// Performance monitoring middleware
export const performanceLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log slow requests (over 1 second)
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        responseTime,
        statusCode: res.statusCode,
        userId: req.user?.id,
      });
    }
    
    // Log performance metrics for monitoring
    if (config.monitoring.enabled) {
      logger.debug('Performance metrics', {
        method: req.method,
        url: req.url,
        responseTime,
        statusCode: res.statusCode,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      });
    }
  });
  
  next();
};

// Security event logger
export const securityLogger = {
  loginAttempt: (email: string, success: boolean, ip: string, userAgent?: string) => {
    logger.info('Login attempt', {
      event: 'login_attempt',
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  },

  accessDenied: (userId: string, resource: string, action: string, ip: string) => {
    logger.warn('Access denied', {
      event: 'access_denied',
      userId,
      resource,
      action,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  suspiciousActivity: (userId: string, activity: string, metadata: any, ip: string) => {
    logger.warn('Suspicious activity', {
      event: 'suspicious_activity',
      userId,
      activity,
      metadata,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  dataAccess: (userId: string, resource: string, action: string, resourceId?: string) => {
    logger.info('Data access', {
      event: 'data_access',
      userId,
      resource,
      action,
      resourceId,
      timestamp: new Date().toISOString(),
    });
  },
};

// Database operation logger
export const dbLogger = {
  query: (operation: string, table: string, userId?: string, duration?: number) => {
    logger.debug('Database operation', {
      event: 'db_query',
      operation,
      table,
      userId,
      duration,
      timestamp: new Date().toISOString(),
    });
  },

  error: (operation: string, table: string, error: any, userId?: string) => {
    logger.error('Database error', {
      event: 'db_error',
      operation,
      table,
      error: error.message,
      stack: error.stack,
      userId,
      timestamp: new Date().toISOString(),
    });
  },
};

// WebSocket event logger
export const wsLogger = {
  connection: (socketId: string, userId?: string) => {
    logger.info('WebSocket connection', {
      event: 'ws_connection',
      socketId,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  disconnection: (socketId: string, userId?: string, reason?: string) => {
    logger.info('WebSocket disconnection', {
      event: 'ws_disconnection',
      socketId,
      userId,
      reason,
      timestamp: new Date().toISOString(),
    });
  },

  message: (event: string, socketId: string, userId?: string, room?: string) => {
    logger.debug('WebSocket message', {
      event: 'ws_message',
      messageType: event,
      socketId,
      userId,
      room,
      timestamp: new Date().toISOString(),
    });
  },

  error: (error: any, socketId: string, userId?: string) => {
    logger.error('WebSocket error', {
      event: 'ws_error',
      error: error.message,
      stack: error.stack,
      socketId,
      userId,
      timestamp: new Date().toISOString(),
    });
  },
};

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// File operation logger
export const fileLogger = {
  upload: (filename: string, size: number, userId: string, taskId?: string) => {
    logger.info('File upload', {
      event: 'file_upload',
      filename,
      size,
      userId,
      taskId,
      timestamp: new Date().toISOString(),
    });
  },

  download: (filename: string, userId: string) => {
    logger.info('File download', {
      event: 'file_download',
      filename,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  delete: (filename: string, userId: string) => {
    logger.info('File deletion', {
      event: 'file_delete',
      filename,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  error: (operation: string, filename: string, error: any, userId?: string) => {
    logger.error('File operation error', {
      event: 'file_error',
      operation,
      filename,
      error: error.message,
      userId,
      timestamp: new Date().toISOString(),
    });
  },
};

// Export the main logger instance
export { logger };
export default logger;