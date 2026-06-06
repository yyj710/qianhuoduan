import prisma from '../config/prisma.js';
import { AppError } from './auth.service.js';

export class MessageService {
  async send(senderId: number, data: { receiverId: number; content: string; type?: string; orderId?: number; extraData?: string }) {
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: data.receiverId,
        type: data.type || 'chat',
        content: data.content,
        orderId: data.orderId || null,
        extraData: data.extraData,
      },
    });
    return message;
  }

  async list(userId: number, params: { page?: number; pageSize?: number; peerId?: number }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const where: any = {};

    if (params.peerId) {
      where.OR = [
        { senderId: userId, receiverId: params.peerId },
        { senderId: params.peerId, receiverId: userId },
      ];
    } else {
      where.OR = [{ senderId: userId }, { receiverId: userId }];
    }

    const [list, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: { select: { id: true, username: true, avatar: true } },
          receiver: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { createTime: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.message.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  async markAsRead(userId: number, messageIds: number[]) {
    await prisma.message.updateMany({
      where: { id: { in: messageIds }, receiverId: userId, readStatus: 0 },
      data: { readStatus: 1 },
    });
  }

  async getUnreadCount(userId: number) {
    return prisma.message.count({ where: { receiverId: userId, readStatus: 0 } });
  }

  async getConversations(userId: number) {
    // Get all messages involving the user
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        receiver: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createTime: 'desc' },
    });

    // Group by peer and order
    const peerMap = new Map<string, any>();
    for (const msg of messages) {
      const peerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const key = msg.orderId ? `${peerId}_${msg.orderId}` : `${peerId}`;
      if (!peerMap.has(key)) {
        peerMap.set(key, {
          peerId,
          peer: msg.senderId === userId ? msg.receiver : msg.sender,
          lastMessage: msg.content,
          lastTime: msg.createTime,
          unreadCount: 0,
          orderId: msg.orderId,
          type: msg.type,
        });
      }
      if (msg.receiverId === userId && msg.readStatus === 0) {
        peerMap.get(key)!.unreadCount++;
      }
    }

    return Array.from(peerMap.values());
  }
}

export const messageService = new MessageService();
