import { Router } from 'express';
import { body, param } from 'express-validator';

import { supabaseAdmin } from '@/config/supabase';
import {
  asyncHandler,
  AuthorizationError,
  ConflictError,
  NotFoundError,
  successResponse,
} from '@/middleware/errorHandler';
import { securityLogger } from '@/middleware/logger';
import {
  isValidUUID,
  validateUUIDParam,
  validationErrorHandler,
} from '@/middleware/validation';

const router = Router();

type FavoriteItemType = 'project' | 'task' | 'sprint';

function mapProject(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : undefined,
    key: String(row.key),
    color: String(row.color || '#3B82F6'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTask(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    type: row.type,
    status: row.status,
    priority: row.priority,
    storyPoints: row.story_points,
    projectId: row.project_id ? String(row.project_id) : undefined,
    assigneeId: row.assignee_id ? String(row.assignee_id) : undefined,
    reporterId: row.reporter_id ? String(row.reporter_id) : undefined,
    sprintId: row.sprint_id ? String(row.sprint_id) : undefined,
    labels: Array.isArray(row.labels) ? row.labels : [],
    dueDate: row.due_date,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSprint(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    goal: row.goal ? String(row.goal) : undefined,
    projectId: String(row.project_id),
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFavorite(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    itemType: row.item_type as FavoriteItemType,
    itemId: String(row.item_id),
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function enrichFavorites(favorites: Record<string, unknown>[]) {
  const projectIds = favorites
    .filter((f) => f.item_type === 'project')
    .map((f) => f.item_id as string);
  const taskIds = favorites
    .filter((f) => f.item_type === 'task')
    .map((f) => f.item_id as string);
  const sprintIds = favorites
    .filter((f) => f.item_type === 'sprint')
    .map((f) => f.item_id as string);

  const [projectsRes, tasksRes, sprintsRes] = await Promise.all([
    projectIds.length
      ? supabaseAdmin.from('projects').select('*').in('id', projectIds)
      : Promise.resolve({ data: [] }),
    taskIds.length
      ? supabaseAdmin.from('tasks').select('*').in('id', taskIds)
      : Promise.resolve({ data: [] }),
    sprintIds.length
      ? supabaseAdmin.from('sprints').select('*').in('id', sprintIds)
      : Promise.resolve({ data: [] }),
  ]);

  const projects = new Map(
    (projectsRes.data || []).map((p) => [String(p.id), mapProject(p)])
  );
  const tasks = new Map(
    (tasksRes.data || []).map((t) => [String(t.id), mapTask(t)])
  );
  const sprints = new Map(
    (sprintsRes.data || []).map((s) => [String(s.id), mapSprint(s)])
  );

  return favorites.map((row) => {
    const base = mapFavorite(row);
    const itemId = String(row.item_id);
    const itemType = row.item_type as FavoriteItemType;

    return {
      ...base,
      project: itemType === 'project' ? projects.get(itemId) : undefined,
      task: itemType === 'task' ? tasks.get(itemId) : undefined,
      sprint: itemType === 'sprint' ? sprints.get(itemId) : undefined,
    };
  });
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    if (!req.user) throw new AuthorizationError('Authentication required');

    const { data: favorites, error } = await supabaseAdmin
      .from('favorites')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = await enrichFavorites(favorites || []);
    securityLogger.dataAccess(req.user.id, 'favorites', 'list', req.user.id);
    return successResponse(res, enriched, 'Favorites retrieved successfully');
  })
);

router.get(
  '/check/:itemType/:itemId',
  param('itemType').isIn(['project', 'task', 'sprint']),
  validationErrorHandler,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new AuthorizationError('Authentication required');

    const { itemType, itemId } = req.params;

    if (!isValidUUID(itemId)) {
      return successResponse(res, { is_favorited: false, favorite: null });
    }

    const { data: favorite, error } = await supabaseAdmin
      .from('favorites')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle();

    if (error) throw error;

    return successResponse(res, {
      is_favorited: Boolean(favorite),
      favorite: favorite ? mapFavorite(favorite) : null,
    });
  })
);

router.post(
  '/',
  body('itemType').isIn(['project', 'task', 'sprint']),
  body('itemId').isUUID(),
  body('notes').optional().isString().isLength({ max: 500 }),
  validationErrorHandler,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new AuthorizationError('Authentication required');

    const { itemType, itemId, notes } = req.body;

    const { data: existing } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle();

    if (existing) {
      throw new ConflictError('Item is already in favorites');
    }

    const { data: created, error } = await supabaseAdmin
      .from('favorites')
      .insert({
        user_id: req.user.id,
        item_type: itemType,
        item_id: itemId,
        notes: notes || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    securityLogger.dataAccess(req.user.id, 'favorite', 'create', created.id);
    return successResponse(res, mapFavorite(created), 'Added to favorites', 201);
  })
);

router.patch(
  '/:id',
  validateUUIDParam('id'),
  body('notes').optional().isString().isLength({ max: 500 }),
  validationErrorHandler,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new AuthorizationError('Authentication required');

    const { id } = req.params;
    const { notes } = req.body;

    const { data: updated, error } = await supabaseAdmin
      .from('favorites')
      .update({ notes: notes ?? null })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error || !updated) throw new NotFoundError('Favorite not found');

    return successResponse(res, mapFavorite(updated), 'Favorite updated successfully');
  })
);

router.delete(
  '/:id',
  validateUUIDParam('id'),
  validationErrorHandler,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new AuthorizationError('Authentication required');

    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    securityLogger.dataAccess(req.user.id, 'favorite', 'delete', id);
    return successResponse(res, null, 'Removed from favorites');
  })
);

export default router;
