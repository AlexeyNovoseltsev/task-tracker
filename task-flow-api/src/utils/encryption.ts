import crypto from 'crypto';
import { encryption } from '../config/security';

interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export const encrypt = (text: string): EncryptedData => {
  try {
    const key = encryption.getKey();
    const iv = crypto.randomBytes(encryption.ivLength);
    const cipher = crypto.createCipherGCM(encryption.algorithm, key, iv);
    cipher.setAAD(Buffer.from('taskflow-pro', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Decrypt data encrypted with AES-256-GCM
 */
export const decrypt = (encryptedData: EncryptedData): string => {
  try {
    const key = encryption.getKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipherGCM(encryption.algorithm, key, iv);
    decipher.setAAD(Buffer.from('taskflow-pro', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Hash sensitive data using SHA-256
 */
export const hash = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate cryptographically secure random string
 */
export const generateSecureRandom = (length: number): string => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

/**
 * Generate secure token for API keys, reset tokens, etc.
 */
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('base64url');
};

/**
 * Create HMAC signature for data integrity
 */
export const createHMAC = (data: string, secret?: string): string => {
  const key = secret || encryption.getKey().toString('hex');
  return crypto.createHmac('sha256', key).update(data).digest('hex');
};

/**
 * Verify HMAC signature
 */
export const verifyHMAC = (data: string, signature: string, secret?: string): boolean => {
  try {
    const expectedSignature = createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
};

/**
 * Encrypt object data (JSON)
 */
export const encryptObject = (obj: any): EncryptedData => {
  const jsonString = JSON.stringify(obj);
  return encrypt(jsonString);
};

/**
 * Decrypt object data (JSON)
 */
export const decryptObject = <T = any>(encryptedData: EncryptedData): T => {
  const jsonString = decrypt(encryptedData);
  return JSON.parse(jsonString);
};

/**
 * Secure comparison to prevent timing attacks
 */
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
};

/**
 * Generate salt for password hashing
 */
export const generateSalt = (rounds: number = 12): string => {
  return crypto.randomBytes(rounds).toString('hex');
};

/**
 * Key derivation function using PBKDF2
 */
export const deriveKey = (password: string, salt: string, iterations: number = 100000): Buffer => {
  return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
};

/**
 * Encrypt file contents
 */
export const encryptFile = (fileBuffer: Buffer): EncryptedData => {
  const text = fileBuffer.toString('base64');
  return encrypt(text);
};

/**
 * Decrypt file contents
 */
export const decryptFile = (encryptedData: EncryptedData): Buffer => {
  const base64Text = decrypt(encryptedData);
  return Buffer.from(base64Text, 'base64');
};

/**
 * Password encryption utilities (different from bcrypt hashing)
 */
export const passwordEncryption = {
  /**
   * Encrypt password for storage (additional layer on top of bcrypt)
   */
  encryptPassword: (hashedPassword: string): EncryptedData => {
    return encrypt(hashedPassword);
  },

  /**
   * Decrypt password for verification
   */
  decryptPassword: (encryptedData: EncryptedData): string => {
    return decrypt(encryptedData);
  },
};

/**
 * Session data encryption
 */
export const sessionEncryption = {
  /**
   * Encrypt session data
   */
  encryptSessionData: (sessionData: any): string => {
    const encrypted = encryptObject(sessionData);
    return Buffer.from(JSON.stringify(encrypted)).toString('base64');
  },

  /**
   * Decrypt session data
   */
  decryptSessionData: <T = any>(encryptedSession: string): T => {
    const encrypted = JSON.parse(Buffer.from(encryptedSession, 'base64').toString());
    return decryptObject<T>(encrypted);
  },
};

/**
 * API key encryption for external integrations
 */
export const apiKeyEncryption = {
  /**
   * Encrypt API key for storage
   */
  encryptApiKey: (apiKey: string): string => {
    const encrypted = encrypt(apiKey);
    return Buffer.from(JSON.stringify(encrypted)).toString('base64');
  },

  /**
   * Decrypt API key for use
   */
  decryptApiKey: (encryptedApiKey: string): string => {
    const encrypted = JSON.parse(Buffer.from(encryptedApiKey, 'base64').toString());
    return decrypt(encrypted);
  },
};

/**
 * Utility to mask sensitive data in logs
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(Math.max(0, data.length - visibleChars * 2));
  
  return `${start}${masked}${end}`;
};
