import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { success } from '../utils/response.js';

export class NotificationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { readStatus } = req.query;
      const list = await notificationService.list(req.user!.userId, readStatus !== undefined ? Number(readStatus) : undefined);
      success(res, list);
    } catch (e) { next(e); }
  }

  async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user!.userId);
      success(res, { count });
    } catch (e) { next(e); }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      await notificationService.markRead(req.user!.userId, ids);
      success(res, null, '已标记已读');
    } catch (e) { next(e); }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllRead(req.user!.userId);
      success(res, null, '全部已读');
    } catch (e) { next(e); }
  }
}

export const notificationController = new NotificationController();
