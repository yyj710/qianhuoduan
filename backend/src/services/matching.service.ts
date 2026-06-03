import prisma from '../config/prisma.js';

export interface MatchResult {
  skillId: number;
  userId: number;
  username: string;
  avatar: string | null;
  title: string;
  tags: string[];
  price: number;
  campus: string;
  creditScore: number;
  onlineStatus: number;
  totalScore: number;
  tagScore: number;
  ratingScore: number;
  campusScore: number;
  onlineScore: number;
}

export class MatchingService {
  async matchDemand(demandId: number): Promise<MatchResult[]> {
    const demand = await prisma.demand.findUnique({ where: { id: demandId } });
    if (!demand) return [];

    const demandTags: string[] = JSON.parse(demand.tags);

    const skills = await prisma.skill.findMany({
      where: { status: 1 },
      include: { user: { select: { id: true, username: true, avatar: true, creditScore: true, onlineStatus: true, lastActiveTime: true, campus: true } } },
    });

    const results: MatchResult[] = skills.map(skill => {
      const skillTags: string[] = JSON.parse(skill.tags);

      const tagScore = this.calculateTagMatch(demandTags, skillTags);
      const ratingScore = this.calculateRatingScore(skill.user.creditScore);
      const campusScore = this.calculateCampusScore(demand.campus, skill.campus);
      const onlineScore = this.calculateOnlineScore(skill.user.onlineStatus, skill.user.lastActiveTime);

      const totalScore = tagScore * 0.5 + ratingScore * 0.2 + campusScore * 0.2 + onlineScore * 0.1;

      return {
        skillId: skill.id,
        userId: skill.user.id,
        username: skill.user.username,
        avatar: skill.user.avatar,
        title: skill.title,
        tags: skillTags,
        price: skill.price,
        campus: skill.campus,
        creditScore: skill.user.creditScore,
        onlineStatus: skill.user.onlineStatus,
        totalScore,
        tagScore,
        ratingScore,
        campusScore,
        onlineScore,
      };
    });

    results.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.creditScore - a.creditScore;
    });

    return results.slice(0, 3);
  }

  private calculateTagMatch(demandTags: string[], skillTags: string[]): number {
    if (demandTags.length === 0) return 0;
    const matched = demandTags.filter(tag => skillTags.includes(tag)).length;
    return (matched / demandTags.length) * 100;
  }

  private calculateRatingScore(creditScore: number): number {
    if (creditScore >= 5.0) return 100;
    if (creditScore >= 3.0) return (creditScore - 3.0) * 100;
    return 0;
  }

  private calculateCampusScore(demandCampus: string, skillCampus: string): number {
    if (demandCampus === skillCampus) return 100;
    if (skillCampus === '不限') return 80;
    return 50;
  }

  private calculateOnlineScore(onlineStatus: number, lastActiveTime: Date | null): number {
    const now = new Date();
    if (onlineStatus === 1) return 100;
    if (!lastActiveTime) return 0;
    const diffMinutes = (now.getTime() - new Date(lastActiveTime).getTime()) / 60000;
    if (diffMinutes <= 30) return 80;
    if (diffMinutes <= 120) return 60;
    return 0;
  }
}

export const matchingService = new MatchingService();
