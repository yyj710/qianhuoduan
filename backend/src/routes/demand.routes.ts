import { Router } from 'express';
import { demandController } from '../controllers/demand.controller.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, demandController.create.bind(demandController));
router.get('/', optionalAuth, demandController.list.bind(demandController));
router.get('/:id', optionalAuth, demandController.getById.bind(demandController));
router.get('/:id/matches', optionalAuth, demandController.getMatches.bind(demandController));

export default router;
