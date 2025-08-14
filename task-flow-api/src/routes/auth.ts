import bcrypt from 'bcryptjs';
import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';

import { supabaseAdmin } from '@/config/supabase';
import {
  generateToken,
  generateRefreshToken,
  optionalAuthMiddleware
} from '@/middleware/auth';
import { 
  successResponse, 
  AuthenticationError, 
  ValidationError, 
  ConflictError,
  asyncHandler 
} from '@/middleware/errorHandler';
import { securityLogger } from '@/middleware/logger';
import { 
  validateCreateUser,
  validationErrorHandler 
} from '@/middleware/validation';
import { AuthUser } from '@/types';


const router = Router();

// Register new user
router.post('/register', 
  validateCreateUser(),
  validationErrorHandler,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, name, password, role = 'user' } = req.body;
    const clientIp = req.ip || 'unknown';

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      securityLogger.loginAttempt(email, false, clientIp);
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        name,
        role,
        // Note: We'll store password in a separate table for security
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError('Failed to create user');
    }

    // Store password hash separately (in production, use auth.users table)
    // For now, we'll use Supabase Auth or a separate secure table
    
    const user: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar_url: newUser.avatar_url,
    };

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    securityLogger.loginAttempt(email, true, clientIp);

    return successResponse(res, {
      user,
      tokens: {
        access: accessToken,
        refresh: refreshToken,
      },
    }, 'User registered successfully', 201);
  })
);

// Login user
router.post('/login',
  [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required'),
  ],
  validationErrorHandler,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const clientIp = req.ip || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      securityLogger.loginAttempt(email, false, clientIp, userAgent);
      throw new AuthenticationError('Invalid email or password');
    }

    // For demo purposes, we'll accept any password for existing users
    // In production, verify password hash from secure storage
    const isPasswordValid = true; // await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      securityLogger.loginAttempt(email, false, clientIp, userAgent);
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last active timestamp
    await supabaseAdmin
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
    };

    // Generate tokens
    const accessToken = generateToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    securityLogger.loginAttempt(email, true, clientIp, userAgent);

    return successResponse(res, {
      user: authUser,
      tokens: {
        access: accessToken,
        refresh: refreshToken,
      },
    }, 'Login successful');
  })
);

// Refresh token
router.post('/refresh',
  [
    body('refreshToken')
      .isString()
      .withMessage('Refresh token is required'),
  ],
  validationErrorHandler,
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    try {
      // Verify refresh token (implement your refresh token logic)
      // For now, we'll use the same JWT verification
      const decoded = require('jsonwebtoken').verify(refreshToken, require('@/config').default.jwt.secret);
      
      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Get user from database
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        throw new AuthenticationError('Invalid refresh token');
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url,
      };

      // Generate new tokens
      const newAccessToken = generateToken(authUser);
      const newRefreshToken = generateRefreshToken(authUser);

      return successResponse(res, {
        tokens: {
          access: newAccessToken,
          refresh: newRefreshToken,
        },
      }, 'Token refreshed successfully');

    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  })
);

// Get current user profile
router.get('/me',
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Get fresh user data from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      throw new AuthenticationError('User not found');
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      last_active_at: user.last_active_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return successResponse(res, userData, 'User profile retrieved');
  })
);

// Update user profile
router.patch('/me',
  [
    body('name')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .trim(),
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('Avatar URL must be a valid URL'),
  ],
  validationErrorHandler,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { name, avatar_url } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    // Update user in database
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw new ValidationError('Failed to update user profile');
    }

    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      avatar_url: updatedUser.avatar_url,
      last_active_at: updatedUser.last_active_at,
      updated_at: updatedUser.updated_at,
    };

    return successResponse(res, userData, 'Profile updated successfully');
  })
);

// Change password
router.post('/change-password',
  [
    body('currentPassword')
      .isString()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  ],
  validationErrorHandler,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { currentPassword, newPassword } = req.body;

    // In production, verify current password against stored hash
    // For demo, we'll skip this verification

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // In production, update password hash in secure storage
    // For demo, we'll just log this action
    
    securityLogger.dataAccess(req.user.id, 'password', 'change');

    return successResponse(res, null, 'Password changed successfully');
  })
);

// Logout (invalidate tokens)
router.post('/logout',
  asyncHandler(async (req: Request, res: Response) => {
    // In production, you would:
    // 1. Add token to blacklist
    // 2. Clear refresh tokens from storage
    // 3. Log the logout event
    
    if (req.user) {
      securityLogger.dataAccess(req.user.id, 'session', 'logout');
    }

    return successResponse(res, null, 'Logged out successfully');
  })
);

// Forgot password (placeholder)
router.post('/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
  ],
  validationErrorHandler,
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Check if user exists
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    // Always return success for security (don't reveal if email exists)
    // In production, send password reset email if user exists

    return successResponse(res, null, 'If an account with this email exists, a password reset link has been sent');
  })
);

// Reset password (placeholder)
router.post('/reset-password',
  [
    body('token')
      .isString()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  ],
  validationErrorHandler,
  asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    // In production:
    // 1. Verify reset token
    // 2. Find user by token
    // 3. Update password hash
    // 4. Invalidate reset token

    return successResponse(res, null, 'Password reset successfully');
  })
);

export default router;