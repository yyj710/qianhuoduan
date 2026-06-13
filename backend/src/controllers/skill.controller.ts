import { Request, Response, NextFunction } from 'express';
import { skillService } from '../services/skill.service.js';
import { AppError } from '../services/auth.service.js';
import { success, fail } from '../utils/response.js';

export class SkillController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const skill = await skillService.create(req.user!.userId, req.body);
      success(res, skill, '发布成功');
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await skillService.list({
        page: parseInt(req.query.page as string),
        pageSize: parseInt(req.query.pageSize as string),
        keyword: req.query.keyword as string,
        campus: req.query.campus as string,
        category: req.query.category as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        tag: req.query.tag as string,
        sort: req.query.sort as string,
      });
      success(res, result);
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const skill = await skillService.getById(parseInt(req.params.id));
      success(res, skill);
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const skill = await skillService.update(parseInt(req.params.id), req.user!.userId, req.body);
      success(res, skill, '更新成功');
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await skillService.delete(parseInt(req.params.id), req.user!.userId);
      success(res, null, '删除成功');
    } catch (e) {
      if (e instanceof AppError) { fail(res, e.code, e.message); } else { next(e); }
    }
  }
}

export const skillController = new SkillController();
