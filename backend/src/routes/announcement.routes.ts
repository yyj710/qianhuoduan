import { Router } from 'express';
import { announcementController } from '../controllers/announcement.controller.js';

const router = Router();

// Public read — no auth required for browsing campus news
router.get('/', announcementController.list.bind(announcementController));

export default router;
