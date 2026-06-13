import { Router } from 'express';
import { bookmarkController } from '../controllers/bookmark.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, bookmarkController.add.bind(bookmarkController));
router.delete('/:targetType/:targetId', authMiddleware, bookmarkController.remove.bind(bookmarkController));
router.get('/', authMiddleware, bookmarkController.list.bind(bookmarkController));
router.get('/check', authMiddleware, bookmarkController.check.bind(bookmarkController));

export default router;
