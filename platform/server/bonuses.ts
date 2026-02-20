export interface BonusRule {
  id: number;
  name: string;
  description: string;
  points: number;
  type: 'work_completion' | 'referral' | 'rating' | 'milestone';
  condition?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserBonus {
  id: number;
  userId: number;
  bonusRuleId: number;
  points: number;
  status: 'pending' | 'approved' | 'claimed';
  claimedAt?: Date;
  createdAt: Date;
}

export interface BonusReward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: 'cash' | 'discount' | 'feature_unlock';
  rewardValue: number;
  isActive: boolean;
  createdAt: Date;
}

// Начисление бонусов за выполненную работу
export async function awardWorkCompletionBonus(userId: number, jobId: number, salary: number): Promise<number> {
  const bonusPercentage = 0.05; // 5% от зарплаты
  const bonus = Math.floor(salary * bonusPercentage);
  
  return bonus;
}

// Начисление бонусов за реферала
export async function awardReferralBonus(referrerId: number, referredUserId: number): Promise<number> {
  const baseBonus = 500; // базовый бонус в рублях
  const bonus = baseBonus;
  
  return bonus;
}

// Начисление бонусов за высокий рейтинг
export async function awardRatingBonus(userId: number, rating: number): Promise<number> {
  if (rating >= 4.8) return 300;
  if (rating >= 4.5) return 200;
  if (rating >= 4.0) return 100;
  return 0;
}

// Начисление бонусов за достижения
export async function awardMilestoneBonus(userId: number, milestone: string): Promise<number> {
  const milestoneBonus: Record<string, number> = {
    first_job: 100,
    tenth_job: 500,
    hundredth_job: 2000,
    one_year: 1000,
    perfect_rating: 1500,
  };
  
  return milestoneBonus[milestone] || 0;
}

// Обмен бонусов на награды
export async function redeemBonus(userId: number, rewardId: number, userPoints: number, requiredPoints: number): Promise<boolean> {
  if (userPoints < requiredPoints) {
    return false;
  }
  
  return true;
}

// Расчет общего количества бонусов пользователя
export async function calculateUserBonusBalance(userId: number, bonuses: UserBonus[]): Promise<number> {
  return bonuses
    .filter((b) => b.userId === userId && b.status !== 'claimed')
    .reduce((sum, b) => sum + b.points, 0);
}

// История бонусов
export interface BonusHistory {
  userId: number;
  bonusId: number;
  action: 'earned' | 'redeemed' | 'expired';
  points: number;
  timestamp: Date;
}

// Проверка истечения бонусов (например, через 1 год)
export async function expireOldBonuses(bonuses: UserBonus[]): Promise<UserBonus[]> {
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  
  return bonuses.filter((b) => new Date(b.createdAt) > oneYearAgo);
}

// Система уровней (VIP)
export interface UserLevel {
  userId: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalEarnings: number;
  totalJobs: number;
  averageRating: number;
  bonusMultiplier: number;
}

export async function calculateUserLevel(totalEarnings: number, totalJobs: number, averageRating: number): Promise<UserLevel['level']> {
  if (totalEarnings >= 100000 && totalJobs >= 100 && averageRating >= 4.8) {
    return 'platinum';
  }
  if (totalEarnings >= 50000 && totalJobs >= 50 && averageRating >= 4.5) {
    return 'gold';
  }
  if (totalEarnings >= 20000 && totalJobs >= 20 && averageRating >= 4.0) {
    return 'silver';
  }
  return 'bronze';
}

export async function getBonusMultiplier(level: UserLevel['level']): Promise<number> {
  const multipliers: Record<UserLevel['level'], number> = {
    bronze: 1.0,
    silver: 1.1,
    gold: 1.25,
    platinum: 1.5,
  };
  
  return multipliers[level];
}
