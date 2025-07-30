import { Router, Request, Response } from 'express';
import { successResponse } from '@/middleware/errorHandler';

const router = Router();

// Placeholder routes for tasks
router.get('/', (req: Request, res: Response) => {
  return successResponse(res, [], 'Tasks route - coming soon');
});

router.post('/', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Create task - coming soon', 201);
});

router.get('/:id', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Get task - coming soon');
});

router.patch('/:id', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Update task - coming soon');
});

router.delete('/:id', (req: Request, res: Response) => {
  return successResponse(res, null, 'Delete task - coming soon');
});

export default router;