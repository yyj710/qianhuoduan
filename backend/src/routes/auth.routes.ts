import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, authController.register.bind(authController));
router.post('/login', authLimiter, authController.login.bind(authController));
router.get('/profile', authMiddleware, authController.getProfile.bind(authController));
router.put('/profile', authMiddleware, authController.updateProfile.bind(authController));
router.get('/users/:id', authController.getPublicProfile.bind(authController));

router.post('/verify/apply', authMiddleware, authController.applyVerify.bind(authController));
router.put('/verify/:id', authMiddleware, authController.approveVerify.bind(authController));
router.get('/verify/pending', authMiddleware, authController.getPendingVerifications.bind(authController));
export default router;
