import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnnouncementQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  status?: string;
}

export class AnnouncementService {
  async list(query: AnnouncementQuery) {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 20, 50);
    const where: Prisma.AnnouncementWhereInput = {
      status: query.status || 'published',
    };
    if (query.category && query.category !== 'all') {
      where.category = query.category;
    }

    const [list, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          sourceId: true,
          title: true,
          category: true,
          summary: true,
          publishDate: true,
          eventDate: true,
          eventLocation: true,
          deadline: true,
          sourceUrl: true,
          sourceDept: true,
          createdAt: true,
        },
      }),
      prisma.announcement.count({ where }),
    ]);

    // Get category counts (only published)
    const categoryCounts = await prisma.announcement.groupBy({
      by: ['category'],
      where: { status: 'published', category: { not: null } },
      _count: { id: true },
    });
    const categories: Record<string, number> = {};
    for (const c of categoryCounts) {
      if (c.category) categories[c.category] = c._count.id;
    }

    return { list, total, page, pageSize, categories };
  }

  async upcoming() {
    const now = new Date();
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const fourteenDays = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const [events, deadlines] = await Promise.all([
      prisma.announcement.findMany({
        where: {
          status: 'published',
          eventDate: { gte: now, lte: thirtyDays },
        },
        orderBy: { eventDate: 'asc' },
        select: {
          id: true, sourceId: true, title: true, category: true,
          summary: true, publishDate: true, eventDate: true,
          eventLocation: true, deadline: true, sourceUrl: true, sourceDept: true,
        },
      }),
      prisma.announcement.findMany({
        where: {
          status: 'published',
          deadline: { gte: now, lte: fourteenDays },
        },
        orderBy: { deadline: 'asc' },
        select: {
          id: true, sourceId: true, title: true, category: true,
          summary: true, publishDate: true, eventDate: true,
          eventLocation: true, deadline: true, sourceUrl: true, sourceDept: true,
        },
      }),
    ]);

    return { events, deadlines };
  }
}

export const announcementService = new AnnouncementService();
