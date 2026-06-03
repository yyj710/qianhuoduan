import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service.js';
import { AppError } from '../services/auth.service.js';
import { success, fail } from '../utils/response.js';

export class MessageController {
  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await messageService.send(req.user!.userId, req.body);
      success(res, message, '发送成功');
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await messageService.list(req.user!.userId, {
        page: parseInt(req.query.page as string),
        pageSize: parseInt(req.query.pageSize as string),
        peerId: req.query.peerId ? parseInt(req.query.peerId as string) : undefined,
      });
      success(res, result);
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { messageIds } = req.body;
      if (!messageIds || !Array.isArray(messageIds)) {
        fail(res, 400, 'messageIds必须为数组');
        return;
      }
      await messageService.markAsRead(req.user!.userId, messageIds);
      success(res, null, '标记成功');
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await messageService.getUnreadCount(req.user!.userId);
      success(res, { count });
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await messageService.getConversations(req.user!.userId);
      success(res, conversations);
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }
}

export const messageController = new MessageController();
