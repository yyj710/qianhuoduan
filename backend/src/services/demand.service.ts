import prisma from '../config/prisma.js';
import { AppError } from './auth.service.js';
import { matchingService } from './matching.service.js';

export class DemandService {
  async create(userId: number, data: { title: string; tags: string[]; description: string; budget: number; deadline: string; campus: string }) {
    const demand = await prisma.demand.create({
      data: {
        userId,
        title: data.title,
        tags: JSON.stringify(data.tags),
        description: data.description,
        budget: data.budget,
        deadline: data.deadline,
        campus: data.campus,
      },
    });

    const matches = await matchingService.matchDemand(demand.id);

    await prisma.demand.update({
      where: { id: demand.id },
      data: { matchCount: matches.length },
    });

    return {
      ...demand,
      tags: JSON.parse(demand.tags),
      matches,
    };
  }

  async list(params: { page?: number; pageSize?: number; keyword?: string; campus?: string; status?: number }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const where: any = {};

    if (params.status !== undefined) {
      where.status = params.status;
    } else {
      where.status = 1;
    }
    if (params.keyword) {
      where.OR = [
        { title: { contains: params.keyword } },
        { description: { contains: params.keyword } },
      ];
    }
    if (params.campus) {
      where.campus = params.campus;
    }

    const [list, total] = await Promise.all([
      prisma.demand.findMany({
        where,
        include: { user: { select: { id: true, username: true, avatar: true, creditScore: true, campus: true } } },
        orderBy: { createTime: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.demand.count({ where }),
    ]);

    return { list: list.map(d => ({ ...d, tags: JSON.parse(d.tags) })), total, page, pageSize };
  }

  async getById(id: number) {
    const demand = await prisma.demand.findUnique({
      where: { id },
      include: { user: { select: { id: true, username: true, avatar: true, creditScore: true, campus: true } } },
    });
    if (!demand) throw new AppError(404, '需求不存在');

    await prisma.demand.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    return { ...demand, tags: JSON.parse(demand.tags) };
  }

  async getMatches(id: number) {
    return matchingService.matchDemand(id);
  }
}

export const demandService = new DemandService();
