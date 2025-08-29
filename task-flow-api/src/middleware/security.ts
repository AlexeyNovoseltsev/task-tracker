import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Rate limiting configuration
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP, please try again later',
        retryAfter: Math.round(windowMs / 1000),
      });
    },
  });
};

// Speed limiting for brute force protection
export const createSpeedLimit = (windowMs: number, delayAfter: number, maxDelayMs: number) => {
  return slowDown({
    windowMs,
    delayAfter,
    delayMs: 500, // Start with 500ms delay
    maxDelayMs,
    skipFailedRequests: false,
    skipSuccessfulRequests: true,
  });
};

// Strict rate limiting for authentication endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later'
);

// Speed limiting for authentication (progressive delay)
export const authSpeedLimit = createSpeedLimit(
  15 * 60 * 1000, // 15 minutes
  2, // start slowing down after 2 requests
  10000 // maximum delay of 10 seconds
);

// General API rate limiting
export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100 // limit each IP to 100 requests per windowMs
);

// Input validation and sanitization
export const validateAndSanitize = {
  // Email validation
  email: () => [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required')
      .isLength({ max: 254 })
      .withMessage('Email too long'),
  ],

  // Password validation
  password: () => [
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  ],

  // Name validation
  name: () => [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Zа-яА-Я\s\-']+$/)
      .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  ],

  // Task title validation
  taskTitle: () => [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters')
      .escape(), // Escape HTML entities
  ],

  // Task description validation
  taskDescription: () => [
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description cannot exceed 5000 characters')
      .escape(),
  ],

  // Project name validation
  projectName: () => [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Project name must be between 2 and 100 characters')
      .escape(),
  ],

  // Generic text validation
  text: (field: string, minLength: number = 1, maxLength: number = 1000) => [
    body(field)
      .trim()
      .isLength({ min: minLength, max: maxLength })
      .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`)
      .escape(),
  ],
};

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// CSRF protection
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: 'CSRF token mismatch',
      message: 'Invalid or missing CSRF token',
    });
  }

  next();
};

// Generate CSRF token
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Content Security Policy headers
export const setSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.github.com https://api.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

// Password hashing utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Secure session configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  name: 'taskflow_session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const, // CSRF protection
  },
};

// IP whitelist/blacklist middleware
export const ipFilter = (whitelist?: string[], blacklist?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || '';

    if (blacklist && blacklist.includes(clientIp)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is blocked',
      });
    }

    if (whitelist && whitelist.length > 0 && !whitelist.includes(clientIp)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not whitelisted',
      });
    }

    next();
  };
};

// Audit logging for security events
export const auditLogger = (event: string, userId?: string, metadata?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    metadata,
    ip: metadata?.ip,
    userAgent: metadata?.userAgent,
  };

  // Log to file, database, or external service
  console.log('🔒 Security Audit:', JSON.stringify(logEntry));

  // In production, send to centralized logging
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service (e.g., ELK stack, Splunk, etc.)
  }
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Remove null bytes
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value.replace(/\0/g, '');
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);

  next();
};

// File upload security
export const fileUploadSecurity = {
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
  ],
  
  maxFileSize: 10 * 1024 * 1024, // 10MB
  
  validateFile: (file: any) => {
    if (!file) return { valid: false, error: 'No file provided' };
    
    if (!fileUploadSecurity.allowedMimeTypes.includes(file.mimetype)) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    if (file.size > fileUploadSecurity.maxFileSize) {
      return { valid: false, error: 'File too large' };
    }
    
    return { valid: true };
  },
};
