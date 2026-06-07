import { Router } from 'express';
import { announcementController } from '../controllers/announcement.controller.js';

const router = Router();

// Public read — no auth required for browsing campus news
router.get('/', announcementController.list.bind(announcementController));
router.get('/upcoming', announcementController.upcoming.bind(announcementController));

// Admin endpoints for AI classification
router.get('/admin/pending', announcementController.getPending.bind(announcementController));
router.put('/admin/classify/:id', announcementController.batchUpdate.bind(announcementController));
router.post('/admin/clean', announcementController.cleanOld.bind(announcementController));

export default router;
