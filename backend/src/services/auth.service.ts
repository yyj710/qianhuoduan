import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { config } from '../config/index.js';

export class AuthService {
  async register(data: { username: string; password: string; phone?: string; college?: string; campus?: string; identity?: string; major?: string }) {
    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing) {
      throw new AppError(400, '用户名已存在');
    }

    if (data.password.length < 6) {
      throw new AppError(400, '密码长度至少6位');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        phone: data.phone,
        college: data.college,
        campus: data.campus,
        identity: data.identity,
        major: data.major,
      },
      select: { id: true, username: true, phone: true, college: true, campus: true, creditScore: true, role: true, identity: true, major: true, createTime: true },
    });

    return user;
  }

  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new AppError(400, '用户名或密码错误');
    }

    if (user.status === 0) {
      throw new AppError(403, '账号已被禁用');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError(400, '用户名或密码错误');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { onlineStatus: 1, lastActiveTime: new Date() },
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        college: user.college,
        campus: user.campus,
        avatar: user.avatar,
        creditScore: user.creditScore,
        role: user.role,
        identity: user.identity,
        major: user.major,
        bio: user.bio,
        verified: user.verified,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, phone: true, college: true, campus: true,
        avatar: true, creditScore: true, role: true, onlineStatus: true,
        lastActiveTime: true, createTime: true, identity: true, bio: true,
        major: true, verified: true, verifyInfo: true,
      },
    });
    if (!user) throw new AppError(404, '用户不存在');
    return user;
  }

  async updateProfile(userId: number, data: { phone?: string; college?: string; campus?: string; avatar?: string; identity?: string; bio?: string; major?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, username: true, phone: true, college: true, campus: true,
        avatar: true, creditScore: true, role: true, identity: true, bio: true,
        major: true, verified: true,
      },
    });
    return user;
  }

  async getPublicProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, avatar: true, college: true, campus: true,
        identity: true, major: true, bio: true, creditScore: true, verified: true,
        createTime: true,
      },
    });
    if (!user) throw new AppError(404, '用户不存在');

    const skills = await prisma.skill.findMany({
      where: { userId, status: 1 },
      orderBy: { dealCount: 'desc' },
    });

    const comments = await prisma.comment.findMany({
      where: { targetId: userId, type: 'buyer_to_seller' },
      include: { user: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createTime: 'desc' },
      take: 10,
    });

    const orderCount = await prisma.order.count({ where: { sellerId: userId, status: 2 } });
    const followerCount = await prisma.follow.count({ where: { followingId: userId } });
    const followingCount = await prisma.follow.count({ where: { followerId: userId } });

    return { user, skills, comments, orderCount, followerCount, followingCount };
  }

  async applyVerify(userId: number, verifyInfo: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, '用户不存在');
    if (user.verified) throw new AppError(400, '你已经通过认证');
    if (user.verifyInfo) throw new AppError(400, '认证申请正在审核中');

    await prisma.user.update({
      where: { id: userId },
      data: { verifyInfo },
    });
    return { message: '认证申请已提交，请等待审核' };
  }

  async approveVerify(userId: number, approve: boolean) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, '用户不存在');

    await prisma.user.update({
      where: { id: userId },
      data: {
        verified: approve,
        verifyInfo: approve ? null : user.verifyInfo,
      },
    });

    if (approve) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'system',
          title: '认证通过',
          content: '恭喜你！你的身份认证已通过审核，你的主页将展示认证标识。',
          link: '/profile',
        },
      });
    }

    return { message: approve ? '已通过认证' : '已拒绝认证' };
  }

  async getPendingVerifications() {
    return await prisma.user.findMany({
      where: { verifyInfo: { not: null }, verified: false },
      select: {
        id: true, username: true, avatar: true, identity: true,
        college: true, major: true, verifyInfo: true, createTime: true,
      },
      orderBy: { createTime: 'desc' },
    });
  }
}

export class AppError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const authService = new AuthService();
