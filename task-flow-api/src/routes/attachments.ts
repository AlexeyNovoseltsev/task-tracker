import { Router, Request, Response } from 'express';
import { successResponse } from '@/middleware/errorHandler';

const router = Router();

// Placeholder routes for attachments
router.get('/', (req: Request, res: Response) => {
  return successResponse(res, [], 'Attachments route - coming soon');
});

router.post('/upload', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Upload attachment - coming soon', 201);
});

router.get('/:id', (req: Request, res: Response) => {
  return successResponse(res, {}, 'Get attachment - coming soon');
});

router.delete('/:id', (req: Request, res: Response) => {
  return successResponse(res, null, 'Delete attachment - coming soon');
});

export default router;