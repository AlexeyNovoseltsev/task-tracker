import { Router } from 'express';

import { supabaseAdmin } from '@/config/supabase';
import { asyncHandler, successResponse } from '@/middleware/errorHandler';
import { validateUUIDParam, validationErrorHandler } from '@/middleware/validation';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: any, res: any) => {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, avatar_url')
      .order('name', { ascending: true });

    if (error) throw error;

    return successResponse(res, users || [], 'Users retrieved successfully');
  })
);

router.get(
  '/:id',
  validateUUIDParam('id'),
  validationErrorHandler,
  asyncHandler(async (req: any, res: any) => {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, avatar_url')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    return successResponse(res, user, 'User retrieved successfully');
  })
);

export default router;
