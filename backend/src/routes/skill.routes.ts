import { Router } from 'express';
import { skillController } from '../controllers/skill.controller.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, skillController.create.bind(skillController));
router.get('/', optionalAuth, skillController.list.bind(skillController));
router.get('/:id', optionalAuth, skillController.getById.bind(skillController));
router.put('/:id', authMiddleware, skillController.update.bind(skillController));
router.delete('/:id', authMiddleware, skillController.delete.bind(skillController));

export default router;
