import prisma from '../config/prisma.js';

export class FollowService {
  async follow(followerId: number, followingId: number) {
    if (followerId === followingId) throw new Error('不能关注自己');
    return prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {},
      create: { followerId, followingId },
    });
  }

  async unfollow(followerId: number, followingId: number) {
    return prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  }

  async isFollowing(followerId: number, followingId: number) {
    const record = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!record;
  }

  async listFollowers(userId: number) {
    return prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, username: true, avatar: true, identity: true, college: true } } },
      orderBy: { createTime: 'desc' },
    });
  }

  async listFollowing(userId: number) {
    return prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, username: true, avatar: true, identity: true, college: true } } },
      orderBy: { createTime: 'desc' },
    });
  }

  async getFollowerIds(userId: number) {
    const follows = await prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true },
    });
    return follows.map(f => f.followerId);
  }
}

export const followService = new FollowService();
