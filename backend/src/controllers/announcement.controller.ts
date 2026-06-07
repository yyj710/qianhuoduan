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

  async upcoming(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await announcementService.upcoming();
      success(res, result);
    } catch (e) {
      next(e);
    }
  }

  // Admin endpoint: get all pending announcements with full content
  async getPending(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await announcementService.getPending();
      success(res, list);
    } catch (e) {
      next(e);
    }
  }

  // Admin endpoint: update a single announcement classification
  async batchUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await announcementService.batchUpdate(parseInt(id), req.body);
      success(res, result);
    } catch (e) {
      next(e);
    }
  }

  // Admin endpoint: clean old records
  async cleanOld(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await announcementService.cleanOld();
      success(res, result);
    } catch (e) {
      next(e);
    }
  }
}

export const announcementController = new AnnouncementController();
