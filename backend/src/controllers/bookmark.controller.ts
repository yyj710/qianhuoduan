import { Request, Response, NextFunction } from 'express';
import { bookmarkService } from '../services/bookmark.service.js';
import { success, fail } from '../utils/response.js';

export class BookmarkController {
  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId } = req.body;
      if (!targetType || !targetId) { fail(res, 400, '参数不完整'); return; }
      const result = await bookmarkService.add(req.user!.userId, targetType, targetId);
      success(res, result, '收藏成功');
    } catch (e) { next(e); }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId } = req.params;
      await bookmarkService.remove(req.user!.userId, targetType, Number(targetId));
      success(res, null, '取消收藏成功');
    } catch (e) { next(e); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType } = req.query;
      const list = await bookmarkService.list(req.user!.userId, targetType as string);
      success(res, list);
    } catch (e) { next(e); }
  }

  async check(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId } = req.query;
      const bookmarked = await bookmarkService.isBookmarked(req.user!.userId, targetType as string, Number(targetId));
      success(res, { bookmarked });
    } catch (e) { next(e); }
  }
}

export const bookmarkController = new BookmarkController();
