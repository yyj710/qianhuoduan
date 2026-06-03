import { Request, Response, NextFunction } from 'express';
import { authService, AppError } from '../services/auth.service.js';
import { success, fail } from '../utils/response.js';
import { authLimiter } from '../middleware/rateLimiter.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      success(res, user, '注册成功');
    } catch (e) {
      if (e instanceof AppError) {
        fail(res, e.code, e.message);
      } else {
        next(e);
      }
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        fail(res, 400, '用户名和密码不能为空');
        return;
      }
      const result = await authService.login(username, password);
      success(res, result, '登录成功');
    } catch (e) {
      if (e instanceof AppError) {
        fail(res, e.code, e.message);
      } else {
        next(e);
      }
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      success(res, user);
    } catch (e) {
      if (e instanceof AppError) {
        fail(res, e.code, e.message);
      } else {
        next(e);
      }
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body);
      success(res, user, '更新成功');
    } catch (e) {
      if (e instanceof AppError) {
        fail(res, e.code, e.message);
      } else {
        next(e);
      }
    }
  }
}

export const authController = new AuthController();
