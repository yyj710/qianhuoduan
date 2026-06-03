import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { AppError } from '../services/auth.service.js';
import { success, fail } from '../utils/response.js';

export class OrderController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.create(req.user!.userId, req.body);
      success(res, order, '订单创建成功');
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.list(req.user!.userId, {
        page: parseInt(req.query.page as string),
        pageSize: parseInt(req.query.pageSize as string),
        role: req.query.role as string,
        status: req.query.status ? parseInt(req.query.status as string) : undefined,
      });
      success(res, result);
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getById(parseInt(req.params.id));
      success(res, order);
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.confirm(parseInt(req.params.id), req.user!.userId);
      success(res, order, '订单已确认');
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.complete(parseInt(req.params.id), req.user!.userId);
      success(res, order, '订单已完成，请评价');
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.cancel(parseInt(req.params.id), req.user!.userId);
      success(res, order, '订单已取消');
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async evaluate(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await orderService.evaluate(parseInt(req.params.id), req.user!.userId, req.body);
      success(res, comment, '评价成功');
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }
}

export const orderController = new OrderController();
