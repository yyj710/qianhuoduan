import prisma from '../config/prisma.js';

export class BookmarkService {
  async add(userId: number, targetType: string, targetId: number) {
    return prisma.bookmark.upsert({
      where: { userId_targetType_targetId: { userId, targetType, targetId } },
      update: {},
      create: { userId, targetType, targetId },
    });
  }

  async remove(userId: number, targetType: string, targetId: number) {
    return prisma.bookmark.delete({
      where: { userId_targetType_targetId: { userId, targetType, targetId } },
    });
  }

  async list(userId: number, targetType?: string) {
    const where: any = { userId };
    if (targetType) where.targetType = targetType;
    return prisma.bookmark.findMany({
      where,
      orderBy: { createTime: 'desc' },
    });
  }

  async isBookmarked(userId: number, targetType: string, targetId: number) {
    const record = await prisma.bookmark.findUnique({
      where: { userId_targetType_targetId: { userId, targetType, targetId } },
    });
    return !!record;
  }
}

export const bookmarkService = new BookmarkService();
