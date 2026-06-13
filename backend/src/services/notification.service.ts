import prisma from '../config/prisma.js';

export class NotificationService {
  async create(data: { userId: number; type: string; title: string; content: string; relatedId?: number; relatedType?: string }) {
    return prisma.notification.create({ data });
  }

  async createBatch(notifications: { userId: number; type: string; title: string; content: string; relatedId?: number; relatedType?: string }[]) {
    return prisma.notification.createMany({ data: notifications });
  }

  async list(userId: number, readStatus?: number) {
    const where: any = { userId };
    if (readStatus !== undefined) where.readStatus = readStatus;
    return prisma.notification.findMany({
      where,
      orderBy: { createTime: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: number) {
    return prisma.notification.count({
      where: { userId, readStatus: 0 },
    });
  }

  async markRead(userId: number, ids: number[]) {
    return prisma.notification.updateMany({
      where: { id: { in: ids }, userId },
      data: { readStatus: 1 },
    });
  }

  async markAllRead(userId: number) {
    return prisma.notification.updateMany({
      where: { userId, readStatus: 0 },
      data: { readStatus: 1 },
    });
  }
}

export const notificationService = new NotificationService();
