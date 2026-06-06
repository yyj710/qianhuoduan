import { Router } from 'express';
import { announcementController } from '../controllers/announcement.controller.js';

const router = Router();

// Public read — no auth required for browsing campus news
router.get('/', announcementController.list.bind(announcementController));
router.get('/upcoming', announcementController.upcoming.bind(announcementController));

export default router;
