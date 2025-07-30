import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from './errorHandler';

// Validation error handler middleware
export const validationErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => 
      `${error.type === 'field' ? error.path : 'Unknown field'}: ${error.msg}`
    );
    
    throw new ValidationError(errorMessages.join(', '));
  }
  
  next();
};

// Validation helper functions
export const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const isValidEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const isValidProjectKey = (value: string): boolean => {
  const keyRegex = /^[A-Z]{2,10}$/;
  return keyRegex.test(value);
};

export const isValidDateString = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

// Common validation chains
export const validateUUIDParam = (paramName: string = 'id'): ValidationChain => {
  return param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`);
};

export const validatePagination = (): ValidationChain[] => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
    query('sort')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Sort field must be a string with max 50 characters'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be either "asc" or "desc"'),
  ];
};

// User validation
export const validateCreateUser = (): ValidationChain[] => {
  return [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('name')
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .trim(),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    body('role')
      .optional()
      .isIn(['admin', 'user', 'viewer'])
      .withMessage('Role must be one of: admin, user, viewer'),
  ];
};

export const validateUpdateUser = (): ValidationChain[] => {
  return [
    body('name')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .trim(),
    body('role')
      .optional()
      .isIn(['admin', 'user', 'viewer'])
      .withMessage('Role must be one of: admin, user, viewer'),
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('Avatar URL must be a valid URL'),
  ];
};

// Project validation
export const validateCreateProject = (): ValidationChain[] => {
  return [
    body('name')
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Project name must be between 2 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Description must be at most 1000 characters')
      .trim(),
    body('key')
      .isString()
      .custom(isValidProjectKey)
      .withMessage('Project key must be 2-10 uppercase letters')
      .trim()
      .toUpperCase(),
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color code'),
  ];
};

export const validateUpdateProject = (): ValidationChain[] => {
  return [
    body('name')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Project name must be between 2 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Description must be at most 1000 characters')
      .trim(),
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color code'),
    body('is_archived')
      .optional()
      .isBoolean()
      .withMessage('is_archived must be a boolean'),
  ];
};

// Task validation
export const validateCreateTask = (): ValidationChain[] => {
  return [
    body('title')
      .isString()
      .isLength({ min: 3, max: 500 })
      .withMessage('Task title must be between 3 and 500 characters')
      .trim(),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 5000 })
      .withMessage('Description must be at most 5000 characters')
      .trim(),
    body('type')
      .isIn(['story', 'bug', 'task', 'epic'])
      .withMessage('Type must be one of: story, bug, task, epic'),
    body('priority')
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be one of: low, medium, high'),
    body('story_points')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Story points must be between 0 and 100'),
    body('project_id')
      .isUUID()
      .withMessage('Project ID must be a valid UUID'),
    body('assignee_id')
      .optional()
      .isUUID()
      .withMessage('Assignee ID must be a valid UUID'),
    body('epic_id')
      .optional()
      .isUUID()
      .withMessage('Epic ID must be a valid UUID'),
    body('sprint_id')
      .optional()
      .isUUID()
      .withMessage('Sprint ID must be a valid UUID'),
    body('labels')
      .optional()
      .isArray()
      .withMessage('Labels must be an array'),
    body('labels.*')
      .optional()
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each label must be between 1 and 50 characters'),
    body('due_date')
      .optional()
      .custom(isValidDateString)
      .withMessage('Due date must be a valid date string'),
    body('estimated_hours')
      .optional()
      .isFloat({ min: 0, max: 999.99 })
      .withMessage('Estimated hours must be between 0 and 999.99'),
  ];
};

export const validateUpdateTask = (): ValidationChain[] => {
  return [
    body('title')
      .optional()
      .isString()
      .isLength({ min: 3, max: 500 })
      .withMessage('Task title must be between 3 and 500 characters')
      .trim(),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 5000 })
      .withMessage('Description must be at most 5000 characters')
      .trim(),
    body('type')
      .optional()
      .isIn(['story', 'bug', 'task', 'epic'])
      .withMessage('Type must be one of: story, bug, task, epic'),
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'in-review', 'done'])
      .withMessage('Status must be one of: todo, in-progress, in-review, done'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be one of: low, medium, high'),
    body('story_points')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Story points must be between 0 and 100'),
    body('assignee_id')
      .optional()
      .isUUID()
      .withMessage('Assignee ID must be a valid UUID'),
    body('sprint_id')
      .optional()
      .isUUID()
      .withMessage('Sprint ID must be a valid UUID'),
    body('labels')
      .optional()
      .isArray()
      .withMessage('Labels must be an array'),
    body('labels.*')
      .optional()
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each label must be between 1 and 50 characters'),
    body('due_date')
      .optional()
      .custom((value) => value === null || isValidDateString(value))
      .withMessage('Due date must be a valid date string or null'),
    body('estimated_hours')
      .optional()
      .isFloat({ min: 0, max: 999.99 })
      .withMessage('Estimated hours must be between 0 and 999.99'),
  ];
};

// Sprint validation
export const validateCreateSprint = (): ValidationChain[] => {
  return [
    body('name')
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Sprint name must be between 2 and 100 characters')
      .trim(),
    body('goal')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Goal must be at most 500 characters')
      .trim(),
    body('start_date')
      .custom(isValidDateString)
      .withMessage('Start date must be a valid date string'),
    body('end_date')
      .custom(isValidDateString)
      .withMessage('End date must be a valid date string')
      .custom((value, { req }) => {
        const startDate = new Date(req.body.start_date);
        const endDate = new Date(value);
        return endDate > startDate;
      })
      .withMessage('End date must be after start date'),
    body('capacity')
      .isInt({ min: 0, max: 1000 })
      .withMessage('Capacity must be between 0 and 1000'),
    body('project_id')
      .isUUID()
      .withMessage('Project ID must be a valid UUID'),
  ];
};

export const validateUpdateSprint = (): ValidationChain[] => {
  return [
    body('name')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Sprint name must be between 2 and 100 characters')
      .trim(),
    body('goal')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Goal must be at most 500 characters')
      .trim(),
    body('start_date')
      .optional()
      .custom(isValidDateString)
      .withMessage('Start date must be a valid date string'),
    body('end_date')
      .optional()
      .custom(isValidDateString)
      .withMessage('End date must be a valid date string'),
    body('status')
      .optional()
      .isIn(['planned', 'active', 'completed'])
      .withMessage('Status must be one of: planned, active, completed'),
    body('capacity')
      .optional()
      .isInt({ min: 0, max: 1000 })
      .withMessage('Capacity must be between 0 and 1000'),
  ];
};

// Comment validation
export const validateCreateComment = (): ValidationChain[] => {
  return [
    body('content')
      .isString()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Comment content must be between 1 and 2000 characters')
      .trim(),
    body('task_id')
      .isUUID()
      .withMessage('Task ID must be a valid UUID'),
    body('parent_id')
      .optional()
      .isUUID()
      .withMessage('Parent ID must be a valid UUID'),
  ];
};

export const validateUpdateComment = (): ValidationChain[] => {
  return [
    body('content')
      .isString()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Comment content must be between 1 and 2000 characters')
      .trim(),
  ];
};

// Time entry validation
export const validateCreateTimeEntry = (): ValidationChain[] => {
  return [
    body('description')
      .isString()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be between 1 and 500 characters')
      .trim(),
    body('hours')
      .isFloat({ min: 0.1, max: 24 })
      .withMessage('Hours must be between 0.1 and 24'),
    body('date')
      .custom(isValidDateString)
      .withMessage('Date must be a valid date string'),
    body('task_id')
      .isUUID()
      .withMessage('Task ID must be a valid UUID'),
  ];
};

// File upload validation
export const validateFileUpload = (): ValidationChain[] => {
  return [
    body('task_id')
      .isUUID()
      .withMessage('Task ID must be a valid UUID'),
  ];
};

// Search and filter validation
export const validateTaskFilters = (): ValidationChain[] => {
  return [
    query('search')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Search query must be at most 100 characters'),
    query('status')
      .optional()
      .isIn(['todo', 'in-progress', 'in-review', 'done'])
      .withMessage('Status must be one of: todo, in-progress, in-review, done'),
    query('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be one of: low, medium, high'),
    query('type')
      .optional()
      .isIn(['story', 'bug', 'task', 'epic'])
      .withMessage('Type must be one of: story, bug, task, epic'),
    query('assignee_id')
      .optional()
      .isUUID()
      .withMessage('Assignee ID must be a valid UUID'),
    query('project_id')
      .optional()
      .isUUID()
      .withMessage('Project ID must be a valid UUID'),
    query('sprint_id')
      .optional()
      .isUUID()
      .withMessage('Sprint ID must be a valid UUID'),
  ];
};