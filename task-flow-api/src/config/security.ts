import crypto from 'crypto';

// Encryption configuration
export const encryption = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 12,
  tagLength: 16,
  
  // Generate encryption key from environment or create new one
  getKey: (): Buffer => {
    const keyFromEnv = process.env.ENCRYPTION_KEY;
    if (keyFromEnv) {
      return Buffer.from(keyFromEnv, 'hex');
    }
    
    // Generate new key (should be stored securely in production)
    const newKey = crypto.randomBytes(32);
    console.warn('⚠️  No ENCRYPTION_KEY found in environment. Generated new key:', newKey.toString('hex'));
    return newKey;
  },
};

// JWT configuration
export const jwtConfig = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'taskflow-pro',
  audience: 'taskflow-users',
  
  // Generate JWT secrets from environment or create new ones
  getAccessTokenSecret: (): string => {
    return process.env.JWT_ACCESS_SECRET || crypto.randomBytes(64).toString('hex');
  },
  
  getRefreshTokenSecret: (): string => {
    return process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');
  },
};

// Password policy configuration
export const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  
  // Password strength scoring
  scorePassword: (password: string): { score: number; feedback: string[] } => {
    let score = 0;
    const feedback: string[] = [];
    
    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('At least one lowercase letter');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('At least one uppercase letter');
    
    if (/\d/.test(password)) score += 1;
    else feedback.push('At least one number');
    
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push('At least one special character');
    
    // Bonus points for length and variety
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    return { score, feedback };
  },
  
  // Check if password meets policy requirements
  validatePassword: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < passwordPolicy.minLength) {
      errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
    }
    
    if (password.length > passwordPolicy.maxLength) {
      errors.push(`Password must be no more than ${passwordPolicy.maxLength} characters long`);
    }
    
    if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// CORS configuration
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://taskflow-pro.com',
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

// Rate limiting configuration
export const rateLimitConfig = {
  // General API limits
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // Strict limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
  },
  
  // Limits for expensive operations
  expensive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 requests per hour
  },
  
  // File upload limits
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 uploads per hour
  },
};

// Security headers configuration
export const securityHeaders = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.github.com", "https://api.google.com"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  referrerPolicy: 'strict-origin-when-cross-origin',
  
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
    usb: [],
  },
};

// Session configuration
export const sessionConfig = {
  name: 'taskflow_session',
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiry on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const,
  },
};

// API versioning
export const apiConfig = {
  currentVersion: 'v1',
  supportedVersions: ['v1'],
  deprecatedVersions: [],
  
  // Version-specific configurations
  versions: {
    v1: {
      prefix: '/api/v1',
      deprecationDate: null,
      endOfLifeDate: null,
    },
  },
};

// Audit logging configuration
export const auditConfig = {
  events: {
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    USER_REGISTER: 'user_register',
    PASSWORD_CHANGE: 'password_change',
    EMAIL_CHANGE: 'email_change',
    PROFILE_UPDATE: 'profile_update',
    TASK_CREATE: 'task_create',
    TASK_UPDATE: 'task_update',
    TASK_DELETE: 'task_delete',
    PROJECT_CREATE: 'project_create',
    PROJECT_UPDATE: 'project_update',
    PROJECT_DELETE: 'project_delete',
    SECURITY_VIOLATION: 'security_violation',
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    AUTHENTICATION_FAILURE: 'authentication_failure',
  },
  
  retentionPeriod: 90 * 24 * 60 * 60 * 1000, // 90 days
  
  sensitiveFields: [
    'password',
    'password_hash',
    'access_token',
    'refresh_token',
    'session_id',
    'csrf_token',
  ],
};

// Environment-specific security settings
export const getSecurityConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    encryption,
    jwtConfig,
    passwordPolicy,
    corsConfig,
    rateLimitConfig,
    securityHeaders,
    sessionConfig,
    apiConfig,
    auditConfig,
    
    // Environment flags
    isProduction,
    isDevelopment,
    
    // Security features toggles
    enableCSRF: true,
    enableRateLimit: true,
    enableAuditLogging: true,
    enableEncryption: isProduction,
    enableHTTPS: isProduction,
    enableHSTS: isProduction,
    
    // Development-only features
    enableDebugMode: isDevelopment,
    enableDetailedErrors: isDevelopment,
    enableCORSDebug: isDevelopment,
  };
};
