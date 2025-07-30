import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import { 
  successResponse, 
  paginatedResponse,
  NotFoundError, 
  AuthorizationError,
  ConflictError,
  asyncHandler 
} from '@/middleware/errorHandler';
import { 
  requireProjectMembership,
  requireProjectAdmin 
} from '@/middleware/auth';
import { 
  validateCreateProject,
  validateUpdateProject,
  validateUUIDParam,
  validatePagination,
  validationErrorHandler 
} from '@/middleware/validation';
import { dbLogger, securityLogger } from '@/middleware/logger';
import { ProjectWithStats } from '@/types';

const router = Router();

// Get all projects for the authenticated user
router.get('/',
  validatePagination(),
  validationErrorHandler,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const sort = req.query.sort as string || 'updated_at';
    const order = req.query.order as string || 'desc';

    const startTime = Date.now();

    try {
      // Get projects where user is a member
      const { data: projects, error, count } = await supabaseAdmin
        .from('projects')
        .select(`
          *,
          owner:users!projects_owner_id_fkey(id, name, email, avatar_url),
          project_members!inner(role)
        `, { count: 'exact' })
        .eq('project_members.user_id', req.user.id)
        .eq('is_archived', false)
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        dbLogger.error('SELECT', 'projects', error, req.user.id);
        throw new Error('Failed to fetch projects');
      }

      // Get additional stats for each project
      const projectsWithStats: ProjectWithStats[] = await Promise.all(
        (projects || []).map(async (project) => {
          // Get task counts
          const { count: tasksCount } = await supabaseAdmin
            .from('tasks')
            .select('*', { count: 'exact' })
            .eq('project_id', project.id);

          const { count: completedTasksCount } = await supabaseAdmin
            .from('tasks')
            .select('*', { count: 'exact' })
            .eq('project_id', project.id)
            .eq('status', 'done');

          // Get active sprints count
          const { count: activeSprintsCount } = await supabaseAdmin
            .from('sprints')
            .select('*', { count: 'exact' })
            .eq('project_id', project.id)
            .eq('status', 'active');

          // Get members count
          const { count: membersCount } = await supabaseAdmin
            .from('project_members')
            .select('*', { count: 'exact' })
            .eq('project_id', project.id);

          return {
            ...project,
            tasks_count: tasksCount || 0,
            completed_tasks_count: completedTasksCount || 0,
            active_sprints_count: activeSprintsCount || 0,
            members_count: membersCount || 0,
          };
        })
      );

      dbLogger.query('SELECT', 'projects', req.user.id, Date.now() - startTime);
      securityLogger.dataAccess(req.user.id, 'projects', 'list');

      return paginatedResponse(res, projectsWithStats, {
        page,
        limit,
        total: count || 0,
      }, 'Projects retrieved successfully');

    } catch (error) {
      dbLogger.error('SELECT', 'projects', error, req.user.id);
      throw error;
    }
  })
);

// Get single project by ID
router.get('/:id',
  validateUUIDParam('id'),
  validationErrorHandler,
  requireProjectMembership,
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const startTime = Date.now();

    try {
      // Get project with detailed information
      const { data: project, error } = await supabaseAdmin
        .from('projects')
        .select(`
          *,
          owner:users!projects_owner_id_fkey(id, name, email, avatar_url),
          project_members(
            id,
            role,
            joined_at,
            user:users(id, name, email, avatar_url)
          )
        `)
        .eq('id', projectId)
        .single();

      if (error || !project) {
        throw new NotFoundError('Project not found');
      }

      // Get project statistics
      const { count: tasksCount } = await supabaseAdmin
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId);

      const { count: completedTasksCount } = await supabaseAdmin
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId)
        .eq('status', 'done');

      const { count: sprintsCount } = await supabaseAdmin
        .from('sprints')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId);

      const { count: activeSprintsCount } = await supabaseAdmin
        .from('sprints')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId)
        .eq('status', 'active');

      const projectWithStats = {
        ...project,
        stats: {
          tasks_count: tasksCount || 0,
          completed_tasks_count: completedTasksCount || 0,
          sprints_count: sprintsCount || 0,
          active_sprints_count: activeSprintsCount || 0,
          members_count: project.project_members?.length || 0,
        },
      };

      dbLogger.query('SELECT', 'projects', req.user?.id, Date.now() - startTime);
      securityLogger.dataAccess(req.user?.id || 'unknown', 'project', 'view', projectId);

      return successResponse(res, projectWithStats, 'Project retrieved successfully');

    } catch (error) {
      dbLogger.error('SELECT', 'projects', error, req.user?.id);
      throw error;
    }
  })
);

// Create new project
router.post('/',
  validateCreateProject(),
  validationErrorHandler,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const { name, description, key, color = '#3B82F6' } = req.body;
    const startTime = Date.now();

    try {
      // Check if project key already exists
      const { data: existingProject } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('key', key)
        .single();

      if (existingProject) {
        throw new ConflictError('Project key already exists');
      }

      // Create project
      const { data: newProject, error: projectError } = await supabaseAdmin
        .from('projects')
        .insert({
          name,
          description,
          key,
          color,
          owner_id: req.user.id,
        })
        .select(`
          *,
          owner:users!projects_owner_id_fkey(id, name, email, avatar_url)
        `)
        .single();

      if (projectError) {
        dbLogger.error('INSERT', 'projects', projectError, req.user.id);
        throw new Error('Failed to create project');
      }

      // Add creator as project owner
      const { error: memberError } = await supabaseAdmin
        .from('project_members')
        .insert({
          project_id: newProject.id,
          user_id: req.user.id,
          role: 'owner',
        });

      if (memberError) {
        dbLogger.error('INSERT', 'project_members', memberError, req.user.id);
        // Continue despite member error as project is already created
      }

      const projectWithStats = {
        ...newProject,
        tasks_count: 0,
        completed_tasks_count: 0,
        active_sprints_count: 0,
        members_count: 1,
      };

      dbLogger.query('INSERT', 'projects', req.user.id, Date.now() - startTime);
      securityLogger.dataAccess(req.user.id, 'project', 'create', newProject.id);

      return successResponse(res, projectWithStats, 'Project created successfully', 201);

    } catch (error) {
      dbLogger.error('INSERT', 'projects', error, req.user.id);
      throw error;
    }
  })
);

// Update project
router.patch('/:id',
  validateUUIDParam('id'),
  validateUpdateProject(),
  validationErrorHandler,
  requireProjectAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const { name, description, color, is_archived } = req.body;
    const startTime = Date.now();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (is_archived !== undefined) updateData.is_archived = is_archived;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    try {
      const { data: updatedProject, error } = await supabaseAdmin
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .select(`
          *,
          owner:users!projects_owner_id_fkey(id, name, email, avatar_url)
        `)
        .single();

      if (error || !updatedProject) {
        dbLogger.error('UPDATE', 'projects', error, req.user?.id);
        throw new Error('Failed to update project');
      }

      dbLogger.query('UPDATE', 'projects', req.user?.id, Date.now() - startTime);
      securityLogger.dataAccess(req.user?.id || 'unknown', 'project', 'update', projectId);

      return successResponse(res, updatedProject, 'Project updated successfully');

    } catch (error) {
      dbLogger.error('UPDATE', 'projects', error, req.user?.id);
      throw error;
    }
  })
);

// Delete project (archive)
router.delete('/:id',
  validateUUIDParam('id'),
  validationErrorHandler,
  requireProjectAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const startTime = Date.now();

    try {
      // Soft delete by archiving
      const { data: archivedProject, error } = await supabaseAdmin
        .from('projects')
        .update({ is_archived: true })
        .eq('id', projectId)
        .select()
        .single();

      if (error || !archivedProject) {
        dbLogger.error('UPDATE', 'projects', error, req.user?.id);
        throw new Error('Failed to archive project');
      }

      dbLogger.query('UPDATE', 'projects', req.user?.id, Date.now() - startTime);
      securityLogger.dataAccess(req.user?.id || 'unknown', 'project', 'archive', projectId);

      return successResponse(res, null, 'Project archived successfully');

    } catch (error) {
      dbLogger.error('UPDATE', 'projects', error, req.user?.id);
      throw error;
    }
  })
);

// Get project members
router.get('/:id/members',
  validateUUIDParam('id'),
  validationErrorHandler,
  requireProjectMembership,
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const startTime = Date.now();

    try {
      const { data: members, error } = await supabaseAdmin
        .from('project_members')
        .select(`
          id,
          role,
          joined_at,
          user:users(id, name, email, avatar_url, last_active_at)
        `)
        .eq('project_id', projectId)
        .order('joined_at', { ascending: true });

      if (error) {
        dbLogger.error('SELECT', 'project_members', error, req.user?.id);
        throw new Error('Failed to fetch project members');
      }

      dbLogger.query('SELECT', 'project_members', req.user?.id, Date.now() - startTime);
      securityLogger.dataAccess(req.user?.id || 'unknown', 'project_members', 'list', projectId);

      return successResponse(res, members, 'Project members retrieved successfully');

    } catch (error) {
      dbLogger.error('SELECT', 'project_members', error, req.user?.id);
      throw error;
    }
  })
);

// Add project member
router.post('/:id/members',
  validateUUIDParam('id'),
  [
    require('express-validator').body('user_id')
      .isUUID()
      .withMessage('User ID must be a valid UUID'),
    require('express-validator').body('role')
      .isIn(['admin', 'member', 'viewer'])
      .withMessage('Role must be one of: admin, member, viewer'),
  ],
  validationErrorHandler,
  requireProjectAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const { user_id, role = 'member' } = req.body;
    const startTime = Date.now();

    try {
      // Check if user exists
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, name, email')
        .eq('id', user_id)
        .single();

      if (userError || !user) {
        throw new NotFoundError('User not found');
      }

      // Check if user is already a member
      const { data: existingMember } = await supabaseAdmin
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user_id)
        .single();

      if (existingMember) {
        throw new ConflictError('User is already a member of this project');
      }

      // Add member
      const { data: newMember, error } = await supabaseAdmin
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id,
          role,
          invited_by: req.user?.id,
        })
        .select(`
          id,
          role,
          joined_at,
          user:users(id, name, email, avatar_url)
        `)
        .single();

      if (error) {
        dbLogger.error('INSERT', 'project_members', error, req.user?.id);
        throw new Error('Failed to add project member');
      }

      dbLogger.query('INSERT', 'project_members', req.user?.id, Date.now() - startTime);
      securityLogger.dataAccess(req.user?.id || 'unknown', 'project_members', 'create', projectId);

      return successResponse(res, newMember, 'Member added to project successfully', 201);

    } catch (error) {
      dbLogger.error('INSERT', 'project_members', error, req.user?.id);
      throw error;
    }
  })
);

// Update project member role
router.patch('/:id/members/:memberId',
  validateUUIDParam('id'),
  validateUUIDParam('memberId'),
  [
    require('express-validator').body('role')
      .isIn(['admin', 'member', 'viewer'])
      .withMessage('Role must be one of: admin, member, viewer'),
  ],
  validationErrorHandler,
  requireProjectAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const memberId = req.params.memberId;
    const { role } = req.body;
    const startTime = Date.now();

    try {
      const { data: updatedMember, error } = await supabaseAdmin
        .from('project_members')
        .update({ role })
        .eq('id', memberId)
        .eq('project_id', projectId)
        .select(`
          id,
          role,
          joined_at,
          user:users(id, name, email, avatar_url)
        `)
        .single();

      if (error || !updatedMember) {
        dbLogger.error('UPDATE', 'project_members', error, req.user?.id);
        throw new NotFoundError('Project member not found');
      }

      dbLogger.query('UPDATE', 'project_members', req.user?.id, Date.now() - startTime);
      securityLogger.dataAccess(req.user?.id || 'unknown', 'project_members', 'update', memberId);

      return successResponse(res, updatedMember, 'Member role updated successfully');

    } catch (error) {
      dbLogger.error('UPDATE', 'project_members', error, req.user?.id);
      throw error;
    }
  })
);

// Remove project member
router.delete('/:id/members/:memberId',
  validateUUIDParam('id'),
  validateUUIDParam('memberId'),
  validationErrorHandler,
  requireProjectAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const memberId = req.params.memberId;
    const startTime = Date.now();

    try {
      const { error } = await supabaseAdmin
        .from('project_members')
        .delete()
        .eq('id', memberId)
        .eq('project_id', projectId);

      if (error) {
        dbLogger.error('DELETE', 'project_members', error, req.user?.id);
        throw new Error('Failed to remove project member');
      }

      dbLogger.query('DELETE', 'project_members', req.user?.id, Date.now() - startTime);
      securityLogger.dataAccess(req.user?.id || 'unknown', 'project_members', 'delete', memberId);

      return successResponse(res, null, 'Member removed from project successfully');

    } catch (error) {
      dbLogger.error('DELETE', 'project_members', error, req.user?.id);
      throw error;
    }
  })
);

export default router;