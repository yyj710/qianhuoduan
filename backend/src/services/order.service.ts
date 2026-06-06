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

// Status: 0=待确认 1=进行中 2=已完成 3=已取消
const STATUS_PENDING = 0;
const STATUS_ACTIVE = 1;
const STATUS_COMPLETED = 2;
const STATUS_CANCELLED = 3;

async function sendSysMsg(senderId: number, receiverId: number, orderId: number, content: string) {
  await prisma.message.create({
    data: { senderId, receiverId, orderId, type: 'system', content },
  });
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
        status: STATUS_PENDING,
      },
    });

    await prisma.skill.update({ where: { id: data.skillId }, data: { dealCount: { increment: 1 } } });

    // Notify seller
    const skill = await prisma.skill.findUnique({ where: { id: data.skillId }, select: { title: true } });
    await sendSysMsg(buyerId, data.sellerId, order.id,
      `新订单提醒：有人下单了你的技能"${skill?.title}"，订单号${order.orderNo}，请及时确认。`);

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

    if (params.status !== undefined) where.status = params.status;

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
    if (order.status !== STATUS_PENDING) throw new AppError(400, '当前状态不可确认');
    if (order.buyerId !== userId && order.sellerId !== userId) throw new AppError(403, '无权操作');

    const result = await prisma.order.update({
      where: { id: orderId },
      data: { status: STATUS_ACTIVE, confirmTime: new Date() },
    });

    const notifyId = userId === order.buyerId ? order.sellerId : order.buyerId;
    await sendSysMsg(userId, notifyId, orderId, `订单${order.orderNo}已确认，请开始交付。`);

    return result;
  }

  // Combined complete + evaluate: buyer must rate when completing
  async complete(orderId: number, userId: number, data: { score: number; content?: string }) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    if (order.status !== STATUS_ACTIVE) throw new AppError(400, '当前状态不可完成');
    if (order.buyerId !== userId) throw new AppError(403, '仅需求方可确认完成');

    const targetId = order.sellerId;

    // Create the buyer's evaluation
    const existing = await prisma.comment.findFirst({
      where: { orderId, userId, type: 'buyer_to_seller' },
    });
    if (!existing) {
      await prisma.comment.create({
        data: { userId, targetId, orderId, type: 'buyer_to_seller', score: data.score, content: data.content },
      });
    }

    // Mark order complete
    const result = await prisma.order.update({
      where: { id: orderId },
      data: { status: STATUS_COMPLETED, completeTime: new Date() },
    });

    // Notify seller to optionally rate
    await sendSysMsg(userId, order.sellerId, orderId,
      `订单${order.orderNo}已完成！买家已给出${data.score}星评价，你也可以去评价买家。`);

    return result;
  }

  async cancel(orderId: number, userId: number) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    if (order.status !== STATUS_PENDING) throw new AppError(400, '当前状态不可取消');
    if (order.buyerId !== userId && order.sellerId !== userId) throw new AppError(403, '无权操作');

    await prisma.skill.update({ where: { id: order.skillId }, data: { dealCount: { increment: -1 } } });

    const result = await prisma.order.update({
      where: { id: orderId },
      data: { status: STATUS_CANCELLED },
    });

    const notifyId = userId === order.buyerId ? order.sellerId : order.buyerId;
    await sendSysMsg(userId, notifyId, orderId, `订单${order.orderNo}已被取消。`);

    return result;
  }

  // Optional evaluation for the other party (usually seller rating buyer after completion)
  async evaluate(orderId: number, userId: number, data: { score: number; content?: string }) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    if (order.status !== STATUS_COMPLETED) throw new AppError(400, '订单未完成，无法评价');

    const targetId = userId === order.buyerId ? order.sellerId : order.buyerId;
    const type = userId === order.buyerId ? 'buyer_to_seller' : 'seller_to_buyer';

    const existing = await prisma.comment.findFirst({
      where: { orderId, userId, type },
    });
    if (existing) throw new AppError(400, '您已评价过此订单');

    const comment = await prisma.comment.create({
      data: { userId, targetId, orderId, type, score: data.score, content: data.content },
    });

    // Update credit scores when both have evaluated
    const comments = await prisma.comment.findMany({ where: { orderId } });
    if (comments.length >= 2) {
      const buyerComment = comments.find(c => c.type === 'seller_to_buyer');
      const sellerComment = comments.find(c => c.type === 'buyer_to_seller');

      if (buyerComment) {
        const buyer = await prisma.user.findUnique({ where: { id: order.buyerId } });
        if (buyer) {
          const newScore = Math.max(1.0, Math.min(5.0, (buyer.creditScore + buyerComment.score) / 2));
          await prisma.user.update({ where: { id: order.buyerId }, data: { creditScore: Math.round(newScore * 10) / 10 } });
        }
      }
      if (sellerComment) {
        const seller = await prisma.user.findUnique({ where: { id: order.sellerId } });
        if (seller) {
          const newScore = Math.max(1.0, Math.min(5.0, (seller.creditScore + sellerComment.score) / 2));
          await prisma.user.update({ where: { id: order.sellerId }, data: { creditScore: Math.round(newScore * 10) / 10 } });
        }
      }
    }

    // Notify the other party
    const notifyId = targetId;
    await sendSysMsg(userId, notifyId, orderId, `对方已给你${data.score}星评价，快去查看吧！`);

    return comment;
  }
}

export const orderService = new OrderService();
