import { Request, Response, NextFunction } from 'express';
import { announcementService } from '../services/announcement.service.js';
import { success, fail } from '../utils/response.js';

export class AnnouncementController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await announcementService.list({
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20,
        category: req.query.category as string,
        status: 'published',
      });
      success(res, result);
    } catch (e) {
      next(e);
    }
  }
}

export const announcementController = new AnnouncementController();
