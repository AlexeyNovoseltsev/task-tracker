import { Router } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import {
  requireProjectMembership,
} from '@/middleware/auth';
import {
  asyncHandler,
  NotFoundError,
  successResponse,
  paginatedResponse,
  AuthorizationError,
} from '@/middleware/errorHandler';
import { securityLogger } from '@/middleware/logger';
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskFilters,
  validateUUIDParam,
  validationErrorHandler,
} from '@/middleware/validation';
import { broadcastTaskUpdate } from '@/services/websocket';
import { Task } from '@/types';

const router = Router();

// Middleware to check project_id query param and authorize
const checkProjectQueryParam = asyncHandler(async (req, res, next) => {
  if (!req.user) throw new AuthorizationError('Authentication required');
  const { project_id } = req.query;
  if (!project_id) {
    throw new AuthorizationError('A project_id query parameter is required.');
  }
  req.params.projectId = project_id as string;
  return requireProjectMembership(req, res, next);
});

// Middleware to load a task by ID, attach it to the request, and authorize
const loadTaskAndAuthorize = asyncHandler(async (req, res, next) => {
  if (!req.user) throw new AuthorizationError('Authentication required');
  const { id } = req.params;
  const { data: task, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !task) {
    throw new NotFoundError('Task not found');
  }

  req.task = task; // Attach task to request
  req.params.projectId = task.project_id; // Set projectId for the next middleware
  return requireProjectMembership(req, res, next);
});

// Middleware to check project membership before creating a task
const checkProjectForCreate = asyncHandler(async (req, res, next) => {
  if (!req.user) throw new AuthorizationError('Authentication required');
  const { project_id } = req.body;
  if (!project_id) {
    throw new AuthorizationError('project_id is required to create a task.');
  }
  req.params.projectId = project_id;
  return requireProjectMembership(req, res, next);
});

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      task?: Task;
    }
  }
}

// List all tasks for a project
router.get(
  '/',
  validateTaskFilters(),
  validationErrorHandler,
  checkProjectQueryParam,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new AuthorizationError('User not found');
    const {
      project_id,
      sprint_id,
      assignee_id,
      type,
      status,
      priority,
      search,
    } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('tasks')
      .select('*, assignee:users!tasks_assignee_id_fkey(id, name, avatar_url), project:projects(id, name, key)', { count: 'exact' });

    query = query.eq('project_id', project_id as string);
    if (sprint_id) query = query.eq('sprint_id', sprint_id);
    if (assignee_id) query = query.eq('assignee_id', assignee_id);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (search) query = query.ilike('title', `%${search}%`);

    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: tasks, error, count } = await query;

    if (error) throw error;

    securityLogger.dataAccess(req.user.id, 'tasks', 'list', project_id as string);
    return paginatedResponse(res, tasks, { page, limit, total: count || 0 }, 'Tasks retrieved successfully');
  })
);

// Get a single task by ID
router.get(
  '/:id',
  validateUUIDParam('id'),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req, res) => {
    securityLogger.dataAccess(req.user!.id, 'task', 'view', req.task!.id);
    return successResponse(res, req.task, 'Task retrieved successfully');
  })
);

// Create a new task
router.post(
  '/',
  validateCreateTask(),
  validationErrorHandler,
  checkProjectForCreate,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new AuthorizationError('User not found');
    const { project_id, ...taskData } = req.body;

    const { data: newTask, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        ...taskData,
        project_id,
        reporter_id: req.user.id,
      })
      .select('*')
      .single();

    if (error) throw error;

    const io = req.app.get('io');
    if (io && newTask) {
      broadcastTaskUpdate(io, newTask.id, newTask.project_id, newTask, taskData);
    }

    securityLogger.dataAccess(req.user.id, 'task', 'create', newTask.id);
    return successResponse(res, newTask, 'Task created successfully', 201);
  })
);

// Update a task
router.patch(
  '/:id',
  validateUUIDParam('id'),
  validateUpdateTask(),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data: updatedTask, error } = await supabaseAdmin
      .from('tasks')
      .update(req.body)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !updatedTask) throw new NotFoundError('Task not found after update');

    const io = req.app.get('io');
    if (io) {
      broadcastTaskUpdate(io, updatedTask.id, updatedTask.project_id, updatedTask, req.body);
    }

    securityLogger.dataAccess(req.user!.id, 'task', 'update', updatedTask.id);
    return successResponse(res, updatedTask, 'Task updated successfully');
  })
);

// Delete a task
router.delete(
  '/:id',
  validateUUIDParam('id'),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req, res) => {
    const task = req.task as Task;

    const { error } = await supabaseAdmin.from('tasks').delete().eq('id', task.id);
    if (error) throw error;

    const io = req.app.get('io');
    if (io) {
      broadcastTaskUpdate(io, task.id, task.project_id, { id: task.id, _deleted: true }, { _deleted: true });
    }

    securityLogger.dataAccess(req.user!.id, 'task', 'delete', task.id);
    return successResponse(res, null, 'Task deleted successfully');
  })
);

export default router;