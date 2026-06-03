import { Request, Response, NextFunction } from 'express';
import { demandService } from '../services/demand.service.js';
import { AppError } from '../services/auth.service.js';
import { success, fail } from '../utils/response.js';

export class DemandController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const demand = await demandService.create(req.user!.userId, req.body);
      success(res, demand, '发布成功，已为您找到匹配结果');
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await demandService.list({
        page: parseInt(req.query.page as string),
        pageSize: parseInt(req.query.pageSize as string),
        keyword: req.query.keyword as string,
        campus: req.query.campus as string,
        status: req.query.status ? parseInt(req.query.status as string) : undefined,
      });
      success(res, result);
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const demand = await demandService.getById(parseInt(req.params.id));
      success(res, demand);
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async getMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const matches = await demandService.getMatches(parseInt(req.params.id));
      success(res, matches);
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }
}

export const demandController = new DemandController();
