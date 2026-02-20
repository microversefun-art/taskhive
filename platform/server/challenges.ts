/**
 * Challenges & Weekly Quests System
 * Система челленджей и еженедельных квестов
 */

export interface Challenge {
  id: number;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'seasonal';
  target: number;
  reward: {
    bonus: number;
    xp: number;
    badge?: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  startDate: Date;
  endDate: Date;
  progress?: number;
}

export interface UserChallengeProgress {
  userId: number;
  challengeId: number;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  reward?: {
    bonus: number;
    xp: number;
  };
}

/**
 * Получение активных челленджей
 */
export async function getActiveChallenges(): Promise<Challenge[]> {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const challenges: Challenge[] = [
    {
      id: 1,
      title: '🔥 Неделя интенсива',
      description: 'Выполните 10 работ за неделю',
      type: 'weekly',
      target: 10,
      reward: { bonus: 1000, xp: 200, badge: 'week_warrior' },
      difficulty: 'medium',
      icon: '🔥',
      startDate: weekStart,
      endDate: weekEnd,
      progress: 7
    },
    {
      id: 2,
      title: '⭐ Звездный сборщик',
      description: 'Получите 5 пятизвездных оценок',
      type: 'weekly',
      target: 5,
      reward: { bonus: 1500, xp: 250, badge: 'star_collector' },
      difficulty: 'hard',
      icon: '⭐',
      startDate: weekStart,
      endDate: weekEnd,
      progress: 3
    },
    {
      id: 3,
      title: '💰 Финансовый прорыв',
      description: 'Заработайте 10000₽',
      type: 'weekly',
      target: 10000,
      reward: { bonus: 2000, xp: 300 },
      difficulty: 'hard',
      icon: '💰',
      startDate: weekStart,
      endDate: weekEnd,
      progress: 7500
    },
    {
      id: 4,
      title: '🚀 Быстрый старт',
      description: 'Выполните 3 работы в первый день',
      type: 'weekly',
      target: 3,
      reward: { bonus: 500, xp: 100 },
      difficulty: 'easy',
      icon: '🚀',
      startDate: weekStart,
      endDate: weekEnd,
      progress: 3
    }
  ];

  return challenges;
}

/**
 * Получение челленджей пользователя
 */
export async function getUserChallenges(userId: number): Promise<UserChallengeProgress[]> {
  const challenges = await getActiveChallenges();
  
  return challenges.map(challenge => ({
    userId,
    challengeId: challenge.id,
    progress: challenge.progress || 0,
    completed: (challenge.progress || 0) >= challenge.target,
    completedAt: (challenge.progress || 0) >= challenge.target ? new Date() : undefined,
    reward: (challenge.progress || 0) >= challenge.target ? challenge.reward : undefined
  }));
}

/**
 * Обновление прогресса челленджа
 */
export async function updateChallengeProgress(
  userId: number,
  challengeId: number,
  increment: number
): Promise<{ completed: boolean; reward?: { bonus: number; xp: number } }> {
  console.log(`[Challenge] User ${userId} progress on challenge ${challengeId}: +${increment}`);
  
  const challenges = await getActiveChallenges();
  const challenge = challenges.find(c => c.id === challengeId);
  
  if (!challenge) {
    return { completed: false };
  }
  
  const newProgress = (challenge.progress || 0) + increment;
  const completed = newProgress >= challenge.target;
  
  if (completed) {
    console.log(`[Challenge] User ${userId} completed challenge "${challenge.title}"`);
    return { completed: true, reward: challenge.reward };
  }
  
  return { completed: false };
}

/**
 * Получение ежемесячных челленджей
 */
export async function getMonthlyChallenges(): Promise<Challenge[]> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return [
    {
      id: 101,
      title: '👑 Король месяца',
      description: 'Заработайте 50000₽ за месяц',
      type: 'monthly',
      target: 50000,
      reward: { bonus: 5000, xp: 500, badge: 'month_king' },
      difficulty: 'hard',
      icon: '👑',
      startDate: monthStart,
      endDate: monthEnd,
      progress: 35000
    },
    {
      id: 102,
      title: '🏆 Лучший работник',
      description: 'Выполните 50 работ за месяц',
      type: 'monthly',
      target: 50,
      reward: { bonus: 3000, xp: 400, badge: 'best_worker' },
      difficulty: 'hard',
      icon: '🏆',
      startDate: monthStart,
      endDate: monthEnd,
      progress: 32
    }
  ];
}

/**
 * Получение сезонных челленджей
 */
export async function getSeasonalChallenges(): Promise<Challenge[]> {
  const now = new Date();
  const seasonStart = new Date(now.getFullYear(), 0, 1);
  const seasonEnd = new Date(now.getFullYear(), 11, 31);

  return [
    {
      id: 201,
      title: '🎯 Сезонный чемпион',
      description: 'Выполните 200 работ за сезон',
      type: 'seasonal',
      target: 200,
      reward: { bonus: 10000, xp: 1000, badge: 'seasonal_champion' },
      difficulty: 'hard',
      icon: '🎯',
      startDate: seasonStart,
      endDate: seasonEnd,
      progress: 145
    }
  ];
}

/**
 * Получение прогресса челленджа в процентах
 */
export function getChallengeProgressPercent(challenge: Challenge): number {
  if (!challenge.progress) return 0;
  return Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
}

/**
 * Получение времени до конца челленджа
 */
export function getTimeUntilChallengeEnd(challenge: Challenge): {
  days: number;
  hours: number;
  minutes: number;
} {
  const now = new Date();
  const diff = challenge.endDate.getTime() - now.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
}

/**
 * Получение рекомендуемых челленджей для пользователя
 */
export async function getRecommendedChallenges(userId: number): Promise<Challenge[]> {
  const challenges = await getActiveChallenges();
  
  // Фильтруем челленджи, которые еще не завершены
  return challenges.filter(c => (c.progress || 0) < c.target);
}

export const challengesRouter = {
  getActiveChallenges,
  getUserChallenges,
  updateChallengeProgress,
  getMonthlyChallenges,
  getSeasonalChallenges,
  getChallengeProgressPercent,
  getTimeUntilChallengeEnd,
  getRecommendedChallenges
};
