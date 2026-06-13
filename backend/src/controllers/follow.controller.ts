import { Request, Response, NextFunction } from 'express';
import { followService } from '../services/follow.service.js';
import { notificationService } from '../services/notification.service.js';
import { success, fail } from '../utils/response.js';

export class FollowController {
  async follow(req: Request, res: Response, next: NextFunction) {
    try {
      const { followingId } = req.body;
      if (!followingId) { fail(res, 400, '参数不完整'); return; }
      const result = await followService.follow(req.user!.userId, followingId);
      // Create notification
      try {
        await notificationService.create({
          userId: followingId,
          type: 'new_follower',
          title: '新粉丝',
          content: `${req.user!.username} 关注了你`,
          relatedId: req.user!.userId,
          relatedType: 'user',
        });
      } catch { /* ignore notification error */ }
      success(res, result, '关注成功');
    } catch (e) { next(e); }
  }

  async unfollow(req: Request, res: Response, next: NextFunction) {
    try {
      const { followingId } = req.params;
      await followService.unfollow(req.user!.userId, Number(followingId));
      success(res, null, '取消关注成功');
    } catch (e) { next(e); }
  }

  async check(req: Request, res: Response, next: NextFunction) {
    try {
      const { followingId } = req.query;
      const isFollowing = await followService.isFollowing(req.user!.userId, Number(followingId));
      success(res, { isFollowing });
    } catch (e) { next(e); }
  }

  async followers(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await followService.listFollowers(Number(req.params.id));
      success(res, list);
    } catch (e) { next(e); }
  }

  async following(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await followService.listFollowing(Number(req.params.id));
      success(res, list);
    } catch (e) { next(e); }
  }
}

export const followController = new FollowController();
