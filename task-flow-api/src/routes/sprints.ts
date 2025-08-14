import { Router, Request, Response } from 'express';

import { successResponse } from '@/middleware/errorHandler';

const router = Router();

// Placeholder routes for sprints
router.get('/', (req: Request, res: Response) => {
  return successResponse(res, [], 'Sprints route - coming soon');
});

router.post('/', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Create sprint - coming soon', 201);
});

router.get('/:id', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Get sprint - coming soon');
});

router.patch('/:id', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Update sprint - coming soon');
});

router.delete('/:id', (req: Request, res: Response) => {
  return successResponse(res, null, 'Delete sprint - coming soon');
});

export default router;