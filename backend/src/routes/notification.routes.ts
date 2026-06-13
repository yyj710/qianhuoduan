import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, notificationController.list.bind(notificationController));
router.get('/unread-count', authMiddleware, notificationController.unreadCount.bind(notificationController));
router.put('/read', authMiddleware, notificationController.markRead.bind(notificationController));
router.put('/read-all', authMiddleware, notificationController.markAllRead.bind(notificationController));

export default router;
