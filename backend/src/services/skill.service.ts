import prisma from '../config/prisma.js';
import { AppError } from './auth.service.js';
import { followService } from './follow.service.js';
import { notificationService } from './notification.service.js';

export class SkillService {
  async create(userId: number, data: { title: string; category?: string; tags: string[]; description: string; price: number; deliveryTime: string; campus: string }) {
    const skill = await prisma.skill.create({
      data: {
        userId,
        title: data.title,
        category: data.category || null,
        tags: JSON.stringify(data.tags),
        description: data.description,
        price: data.price,
        deliveryTime: data.deliveryTime,
        campus: data.campus,
      },
    });

    // Notify followers
    try {
      const followerIds = await followService.getFollowerIds(userId);
      if (followerIds.length > 0) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        await notificationService.createBatch(
          followerIds.map(fid => ({
            userId: fid,
            type: 'new_skill',
            title: '关注的人发布新技能',
            content: `${user?.username || '用户'} 发布了新技能「${data.title}」`,
            relatedId: skill.id,
            relatedType: 'skill',
          }))
        );
      }
    } catch { /* ignore notification error */ }

    return { ...skill, tags: JSON.parse(skill.tags) };
  }

  async list(params: { page?: number; pageSize?: number; keyword?: string; campus?: string; category?: string; minPrice?: number; maxPrice?: number; tag?: string; sort?: string }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const where: any = { status: 1 };

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
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) where.price.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
    }

    const [list, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        include: { user: { select: { id: true, username: true, avatar: true, creditScore: true, campus: true, identity: true, verified: true } } },
        orderBy: params.sort === 'hot' ? { dealCount: 'desc' } : { createTime: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.skill.count({ where }),
    ]);

    const mapped = list.map(s => ({ ...s, tags: JSON.parse(s.tags) }));

    // Post-filter by tag if specified
    const filtered = params.tag ? mapped.filter(s => (s.tags as string[]).includes(params.tag!)) : mapped;

    return { list: filtered, total, page, pageSize };
  }

  async getById(id: number) {
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: { user: { select: { id: true, username: true, avatar: true, creditScore: true, campus: true, onlineStatus: true, lastActiveTime: true, identity: true, major: true, bio: true, verified: true } } },
    });
    if (!skill) throw new AppError(404, '技能不存在');

    await prisma.skill.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    return { ...skill, tags: JSON.parse(skill.tags) };
  }

  async update(id: number, userId: number, data: { title?: string; category?: string; tags?: string[]; description?: string; price?: number; deliveryTime?: string; campus?: string; status?: number }) {
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new AppError(404, '技能不存在');
    if (skill.userId !== userId) throw new AppError(403, '无权操作');

    const updateData: any = { ...data };
    if (data.tags) updateData.tags = JSON.stringify(data.tags);
    delete updateData.id;

    const updated = await prisma.skill.update({ where: { id }, data: updateData });
    return { ...updated, tags: JSON.parse(updated.tags) };
  }

  async delete(id: number, userId: number) {
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new AppError(404, '技能不存在');
    if (skill.userId !== userId) throw new AppError(403, '无权操作');

    await prisma.skill.update({ where: { id }, data: { status: 0 } });
  }
}

export const skillService = new SkillService();
