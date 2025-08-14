import { Router, Request, Response } from 'express';

import { successResponse } from '@/middleware/errorHandler';

const router = Router();

// Placeholder routes for users
router.get('/', (req: Request, res: Response) => {
  return successResponse(res, [], 'Users route - coming soon');
});

router.get('/:id', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Get user - coming soon');
});

router.patch('/:id', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Update user - coming soon');
});

export default router;