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
import { logTaskActivity, logTaskFieldChanges } from '@/services/taskActivity';
import {
  attachWatchers,
  enrichTaskWithWatchers,
  fetchWatchersForTask,
  fetchWatchersMap,
} from '@/services/taskWatchers';
import { broadcastTaskUpdate } from '@/services/websocket';
import { Task } from '@/types';

const router = Router();

const canAccessPersonalTask = (task: Task, userId: string, role?: string): boolean => {
  if (role === 'admin') return true;
  return task.reporter_id === userId || task.assignee_id === userId;
};

// Authorize list: project tasks need membership, personal tasks are open to auth user
const authorizeTaskList = asyncHandler(async (req: any, res: any, next: any) => {
  if (!req.user) throw new AuthorizationError('Authentication required');
  const { project_id } = req.query;
  if (project_id) {
    req.params.projectId = project_id as string;
    return requireProjectMembership(req, res, next);
  }
  next();
});

// Load task and authorize access (project member or personal task owner)
const loadTaskAndAuthorize = asyncHandler(async (req: any, res: any, next: any) => {
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

  req.task = task;

  if (!task.project_id) {
    if (!canAccessPersonalTask(task, req.user.id, req.user.role)) {
      throw new AuthorizationError('Access denied to this task');
    }
    return next();
  }

  req.params.projectId = task.project_id;
  return requireProjectMembership(req, res, next);
});

// Authorize create: project tasks need membership, personal tasks only need auth
const authorizeTaskCreate = asyncHandler(async (req: any, res: any, next: any) => {
  if (!req.user) throw new AuthorizationError('Authentication required');
  const { project_id } = req.body;
  if (project_id) {
    req.params.projectId = project_id;
    return requireProjectMembership(req, res, next);
  }
  next();
});

declare global {
  namespace Express {
    interface Request {
      task?: Task;
    }
  }
}

router.get(
  '/',
  validateTaskFilters(),
  validationErrorHandler,
  authorizeTaskList,
  asyncHandler(async (req: any, res: any) => {
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

    if (project_id) {
      query = query.eq('project_id', project_id as string);
    } else if (req.user.role === 'admin') {
      query = query.is('project_id', null);
    } else {
      query = query
        .is('project_id', null)
        .or(`reporter_id.eq.${req.user.id},assignee_id.eq.${req.user.id}`);
    }

    if (sprint_id) query = query.eq('sprint_id', sprint_id);
    if (assignee_id) query = query.eq('assignee_id', assignee_id);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (search) query = query.ilike('title', `%${search}%`);

    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: tasks, error, count } = await query;

    if (error) throw error;

    const taskList = tasks || [];
    const watchersMap = await fetchWatchersMap(taskList.map((t) => t.id));
    const tasksWithWatchers = attachWatchers(taskList, watchersMap);

    const scope = project_id ? String(project_id) : 'personal';
    securityLogger.dataAccess(req.user.id, 'tasks', 'list', scope);
    return paginatedResponse(res, tasksWithWatchers, { page, limit, total: count || 0 }, 'Tasks retrieved successfully');
  })
);

router.get(
  '/:id/watchers',
  validateUUIDParam('id'),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req: any, res: any) => {
    const { data: rows, error } = await supabaseAdmin
      .from('task_watchers')
      .select('user_id')
      .eq('task_id', req.task!.id);

    if (error) throw error;

    const watchers = (rows || []).map((r) => r.user_id);
    const watching = Boolean(req.user && watchers.includes(req.user.id));

    return successResponse(res, { watchers, watching }, 'Watchers retrieved successfully');
  })
);

router.get(
  '/:id/activities',
  validateUUIDParam('id'),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req: any, res: any) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const { data: rows, error } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('task_id', req.task!.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return successResponse(res, rows || [], 'Task activities retrieved successfully');
  })
);

router.post(
  '/:id/watchers',
  validateUUIDParam('id'),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req: any, res: any) => {
    const userId = req.body?.user_id as string | undefined;
    if (!userId) {
      throw new AuthorizationError('user_id is required');
    }

    const { error } = await supabaseAdmin
      .from('task_watchers')
      .upsert({ task_id: req.task!.id, user_id: userId });

    if (error) throw error;

    const watchers = await fetchWatchersForTask(req.task!.id);

    await logTaskActivity({
      type: 'watcher_added',
      description: 'добавил наблюдателя',
      taskId: req.task!.id,
      projectId: req.task!.project_id,
      userId: req.user!.id,
      metadata: { watcher_id: userId },
    });

    return successResponse(res, { watchers }, 'Watcher added successfully');
  })
);

router.delete(
  '/:id/watchers/:userId',
  validateUUIDParam('id'),
  validateUUIDParam('userId'),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req: any, res: any) => {
    const { userId } = req.params;

    const { error } = await supabaseAdmin
      .from('task_watchers')
      .delete()
      .eq('task_id', req.task!.id)
      .eq('user_id', userId);

    if (error) throw error;

    const watchers = await fetchWatchersForTask(req.task!.id);
    return successResponse(res, { watchers }, 'Watcher removed successfully');
  })
);

router.post(
  '/:id/watch',
  validateUUIDParam('id'),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req: any, res: any) => {
    const { error } = await supabaseAdmin
      .from('task_watchers')
      .upsert({ task_id: req.task!.id, user_id: req.user!.id });

    if (error) throw error;

    const watchers = await fetchWatchersForTask(req.task!.id);

    await logTaskActivity({
      type: 'watcher_added',
      description: 'начал следить за задачей',
      taskId: req.task!.id,
      projectId: req.task!.project_id,
      userId: req.user!.id,
      metadata: { watcher_id: req.user!.id },
    });

    return successResponse(res, { watching: true, watchers }, 'Now watching task');
  })
);

router.delete(
  '/:id/watch',
  validateUUIDParam('id'),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req: any, res: any) => {
    const { error } = await supabaseAdmin
      .from('task_watchers')
      .delete()
      .eq('task_id', req.task!.id)
      .eq('user_id', req.user!.id);

    if (error) throw error;

    const watchers = await fetchWatchersForTask(req.task!.id);
    return successResponse(res, { watching: false, watchers }, 'Stopped watching task');
  })
);

router.get(
  '/:id',
  validateUUIDParam('id'),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req: any, res: any) => {
    securityLogger.dataAccess(req.user!.id, 'task', 'view', req.task!.id);
    const taskWithWatchers = await enrichTaskWithWatchers(req.task!);
    return successResponse(res, taskWithWatchers, 'Task retrieved successfully');
  })
);

router.post(
  '/',
  validateCreateTask(),
  validationErrorHandler,
  authorizeTaskCreate,
  asyncHandler(async (req: any, res: any) => {
    if (!req.user) throw new AuthorizationError('User not found');
    const { project_id, ...taskData } = req.body;

    const { data: newTask, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        ...taskData,
        project_id: project_id || null,
        reporter_id: req.user.id,
      })
      .select('*')
      .single();

    if (error) throw error;

    await logTaskActivity({
      type: 'created',
      description: 'создал задачу',
      taskId: newTask.id,
      projectId: newTask.project_id,
      userId: req.user.id,
      metadata: { title: newTask.title },
    });

    const io = req.app.get('io');
    if (io && newTask) {
      broadcastTaskUpdate(io, newTask.id, newTask.project_id, newTask, taskData);
    }

    securityLogger.dataAccess(req.user.id, 'task', 'create', newTask.id);
    const taskWithWatchers = await enrichTaskWithWatchers(newTask);
    return successResponse(res, taskWithWatchers, 'Task created successfully', 201);
  })
);

router.patch(
  '/:id',
  validateUUIDParam('id'),
  validateUpdateTask(),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const before = req.task as Task;

    const { data: updatedTask, error } = await supabaseAdmin
      .from('tasks')
      .update(req.body)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !updatedTask) throw new NotFoundError('Task not found after update');

    await logTaskFieldChanges(before, req.user!.id, before as unknown as Record<string, unknown>, req.body);

    const io = req.app.get('io');
    if (io) {
      broadcastTaskUpdate(io, updatedTask.id, updatedTask.project_id, updatedTask, req.body);
    }

    securityLogger.dataAccess(req.user!.id, 'task', 'update', updatedTask.id);
    const taskWithWatchers = await enrichTaskWithWatchers(updatedTask);
    return successResponse(res, taskWithWatchers, 'Task updated successfully');
  })
);

router.delete(
  '/:id',
  validateUUIDParam('id'),
  validationErrorHandler,
  loadTaskAndAuthorize,
  asyncHandler(async (req: any, res: any) => {
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
