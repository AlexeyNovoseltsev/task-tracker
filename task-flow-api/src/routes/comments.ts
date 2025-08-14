import { Router, Request, Response } from 'express';

import { successResponse } from '@/middleware/errorHandler';

const router = Router();

// Placeholder routes for comments
router.get('/', (req: Request, res: Response) => {
  return successResponse(res, [], 'Comments route - coming soon');
});

router.post('/', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Create comment - coming soon', 201);
});

router.get('/:id', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Get comment - coming soon');
});

router.patch('/:id', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Update comment - coming soon');
});

router.delete('/:id', (req: Request, res: Response) => {
  return successResponse(res, null, 'Delete comment - coming soon');
});

export default router;