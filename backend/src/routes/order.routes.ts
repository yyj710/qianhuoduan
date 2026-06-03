import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, orderController.create.bind(orderController));
router.get('/', authMiddleware, orderController.list.bind(orderController));
router.get('/:id', authMiddleware, orderController.getById.bind(orderController));
router.put('/:id/confirm', authMiddleware, orderController.confirm.bind(orderController));
router.put('/:id/complete', authMiddleware, orderController.complete.bind(orderController));
router.put('/:id/cancel', authMiddleware, orderController.cancel.bind(orderController));
router.post('/:id/evaluate', authMiddleware, orderController.evaluate.bind(orderController));

export default router;
