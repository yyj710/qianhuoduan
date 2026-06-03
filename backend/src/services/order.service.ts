import prisma from '../config/prisma.js';
import { AppError } from './auth.service.js';

function generateOrderNo(): string {
  const now = new Date();
  const ts = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SC${ts}${rand}`;
}

export class OrderService {
  async create(buyerId: number, data: { sellerId: number; skillId: number; amount: number }) {
    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        buyerId,
        sellerId: data.sellerId,
        skillId: data.skillId,
        amount: data.amount,
        status: 0,
      },
    });
    return order;
  }

  async list(userId: number, params: { page?: number; pageSize?: number; role?: string; status?: number }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const where: any = {};

    if (params.role === 'buyer') {
      where.buyerId = userId;
    } else if (params.role === 'seller') {
      where.sellerId = userId;
    } else {
      where.OR = [{ buyerId: userId }, { sellerId: userId }];
    }

    if (params.status !== undefined) {
      where.status = params.status;
    }

    const [list, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          buyer: { select: { id: true, username: true, avatar: true } },
          seller: { select: { id: true, username: true, avatar: true } },
          skill: { select: { id: true, title: true } },
        },
        orderBy: { createTime: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  async getById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, username: true, avatar: true, phone: true } },
        seller: { select: { id: true, username: true, avatar: true, phone: true } },
        skill: { select: { id: true, title: true, tags: true, description: true, price: true } },
        comments: {
          include: {
            user: { select: { id: true, username: true } },
            target: { select: { id: true, username: true } },
          },
        },
      },
    });
    if (!order) throw new AppError(404, '订单不存在');

    return {
      ...order,
      skill: order.skill ? { ...order.skill, tags: JSON.parse(order.skill.tags) } : null,
    };
  }

  async confirm(orderId: number, userId: number) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    if (order.status !== 0) throw new AppError(400, '当前状态不可确认');
    if (order.buyerId !== userId && order.sellerId !== userId) throw new AppError(403, '无权操作');

    return prisma.order.update({
      where: { id: orderId },
      data: { status: 1, confirmTime: new Date() },
    });
  }

  async complete(orderId: number, userId: number) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    if (order.status !== 1) throw new AppError(400, '当前状态不可完成');
    if (order.buyerId !== userId) throw new AppError(403, '仅需求方可确认完成');

    return prisma.order.update({
      where: { id: orderId },
      data: { status: 2, completeTime: new Date() },
    });
  }

  async cancel(orderId: number, userId: number) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    if (order.status !== 0) throw new AppError(400, '当前状态不可取消');
    if (order.buyerId !== userId && order.sellerId !== userId) throw new AppError(403, '无权操作');

    await prisma.skill.update({ where: { id: order.skillId }, data: { dealCount: { increment: -1 } } });

    return prisma.order.update({
      where: { id: orderId },
      data: { status: 4 },
    });
  }

  async evaluate(orderId: number, userId: number, data: { score: number; content?: string }) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    if (order.status !== 2) throw new AppError(400, '当前状态不可评价');

    const targetId = userId === order.buyerId ? order.sellerId : order.buyerId;
    const type = userId === order.buyerId ? 'buyer_to_seller' : 'seller_to_buyer';

    const existing = await prisma.comment.findFirst({
      where: { orderId, userId, type },
    });
    if (existing) throw new AppError(400, '您已评价过此订单');

    const comment = await prisma.comment.create({
      data: {
        userId,
        targetId,
        orderId,
        type,
        score: data.score,
        content: data.content,
      },
    });

    // Check if both parties have evaluated
    const comments = await prisma.comment.findMany({ where: { orderId } });
    if (comments.length >= 2) {
      await prisma.order.update({ where: { id: orderId }, data: { status: 3 } });

      // Update credit scores
      const avgScore = comments.reduce((sum, c) => sum + c.score, 0) / comments.length;
      for (const c of comments) {
        const user = await prisma.user.findUnique({ where: { id: c.targetId } });
        if (user) {
          const newScore = Math.max(1.0, Math.min(5.0, (user.creditScore + avgScore / 5.0) / 2));
          await prisma.user.update({ where: { id: c.targetId }, data: { creditScore: Math.round(newScore * 10) / 10 } });
        }
      }
    }

    return comment;
  }
}

export const orderService = new OrderService();
