import { Router } from 'express';
import { followController } from '../controllers/follow.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, followController.follow.bind(followController));
router.delete('/:followingId', authMiddleware, followController.unfollow.bind(followController));
router.get('/check', authMiddleware, followController.check.bind(followController));
router.get('/:id/followers', followController.followers.bind(followController));
router.get('/:id/following', followController.following.bind(followController));

export default router;
