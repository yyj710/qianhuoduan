import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { config } from '../config/index.js';

export class AuthService {
  async register(data: { username: string; password: string; phone?: string; college?: string; campus?: string }) {
    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing) {
      throw new AppError(400, '用户名已存在');
    }

    if (data.password.length < 8 || data.password.length > 20) {
      throw new AppError(400, '密码长度需要8-20位');
    }
    if (!/[a-zA-Z]/.test(data.password) || !/[0-9]/.test(data.password)) {
      throw new AppError(400, '密码需要包含字母和数字');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        phone: data.phone,
        college: data.college,
        campus: data.campus,
      },
      select: { id: true, username: true, phone: true, college: true, campus: true, creditScore: true, role: true, createTime: true },
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
      },
    };
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, phone: true, college: true, campus: true,
        avatar: true, creditScore: true, role: true, onlineStatus: true,
        lastActiveTime: true, createTime: true,
      },
    });
    if (!user) throw new AppError(404, '用户不存在');
    return user;
  }

  async updateProfile(userId: number, data: { phone?: string; college?: string; campus?: string; avatar?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, username: true, phone: true, college: true, campus: true,
        avatar: true, creditScore: true, role: true,
      },
    });
    return user;
  }
}

export class AppError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const authService = new AuthService();
