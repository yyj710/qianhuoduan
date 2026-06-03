import { Router } from 'express';
import { messageController } from '../controllers/message.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, messageController.list.bind(messageController));
router.post('/', authMiddleware, messageController.send.bind(messageController));
router.put('/read', authMiddleware, messageController.markRead.bind(messageController));
router.get('/unread', authMiddleware, messageController.getUnreadCount.bind(messageController));
router.get('/conversations', authMiddleware, messageController.getConversations.bind(messageController));

export default router;
