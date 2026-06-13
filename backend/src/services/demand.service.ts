import prisma from '../config/prisma.js';
import { AppError } from './auth.service.js';
import { matchingService } from './matching.service.js';
import { notificationService } from './notification.service.js';

export class DemandService {
  async create(userId: number, data: { title: string; category?: string; tags: string[]; description: string; budget: number; deadline: string; campus: string }) {
    const demand = await prisma.demand.create({
      data: {
        userId,
        title: data.title,
        category: data.category || null,
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

    // Notify matched skill owners
    try {
      const goodMatches = matches.filter(m => m.totalScore > 60);
      if (goodMatches.length > 0) {
        await notificationService.createBatch(
          goodMatches.map(m => ({
            userId: m.userId,
            type: 'demand_match',
            title: '有新需求匹配你的技能',
            content: `新需求「${data.title}」与你的技能「${m.title}」匹配度较高`,
            relatedId: demand.id,
            relatedType: 'demand',
          }))
        );
      }
    } catch { /* ignore notification error */ }

    return {
      ...demand,
      tags: JSON.parse(demand.tags),
      matches,
    };
  }

  async list(params: { page?: number; pageSize?: number; keyword?: string; campus?: string; category?: string; status?: number }) {
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
    if (params.category) {
      where.category = params.category;
    }

    const [list, total] = await Promise.all([
      prisma.demand.findMany({
        where,
        include: { user: { select: { id: true, username: true, avatar: true, creditScore: true, campus: true, identity: true, verified: true } } },
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
      include: { user: { select: { id: true, username: true, avatar: true, creditScore: true, campus: true, identity: true, verified: true } } },
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
