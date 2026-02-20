/**
 * Leaderboards & Rankings System
 * Система лидербордов и рейтингов
 */

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  avatar?: string;
  value: number;
  badge?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface Leaderboard {
  id: string;
  title: string;
  description: string;
  type: 'earnings' | 'rating' | 'jobs_completed' | 'xp' | 'weekly' | 'monthly';
  period?: 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

/**
 * Получение глобального лидерборда по заработкам
 */
export async function getEarningsLeaderboard(limit: number = 100): Promise<Leaderboard> {
  const entries: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 101,
      username: 'Иван К.',
      avatar: '👨‍💼',
      value: 125000,
      badge: '👑',
      trend: 'up'
    },
    {
      rank: 2,
      userId: 102,
      username: 'Мария П.',
      avatar: '👩‍💼',
      value: 98500,
      badge: '🥈',
      trend: 'stable'
    },
    {
      rank: 3,
      userId: 103,
      username: 'Алексей С.',
      avatar: '👨‍💻',
      value: 87300,
      badge: '🥉',
      trend: 'down'
    },
    {
      rank: 4,
      userId: 104,
      username: 'Елена М.',
      avatar: '👩‍🔧',
      value: 76200,
      trend: 'up'
    },
    {
      rank: 5,
      userId: 105,
      username: 'Дмитрий В.',
      avatar: '👨‍🚀',
      value: 65400,
      trend: 'stable'
    }
  ];
  
  return {
    id: 'earnings_all_time',
    title: '💰 Лидерборд по заработкам',
    description: 'Топ работников по общему заработку',
    type: 'earnings',
    period: 'all_time',
    entries: entries.slice(0, limit),
    lastUpdated: new Date()
  };
}

/**
 * Получение лидерборда по рейтингу
 */
export async function getRatingLeaderboard(limit: number = 100): Promise<Leaderboard> {
  const entries: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 201,
      username: 'Сергей Л.',
      avatar: '⭐',
      value: 4.98,
      badge: '👑',
      trend: 'stable'
    },
    {
      rank: 2,
      userId: 202,
      username: 'Ольга Н.',
      avatar: '⭐',
      value: 4.95,
      badge: '🥈',
      trend: 'up'
    },
    {
      rank: 3,
      userId: 203,
      username: 'Владимир Т.',
      avatar: '⭐',
      value: 4.92,
      badge: '🥉',
      trend: 'down'
    }
  ];
  
  return {
    id: 'rating_all_time',
    title: '⭐ Лидерборд по рейтингу',
    description: 'Топ работников по среднему рейтингу',
    type: 'rating',
    period: 'all_time',
    entries: entries.slice(0, limit),
    lastUpdated: new Date()
  };
}

/**
 * Получение лидерборда по количеству выполненных работ
 */
export async function getJobsCompletedLeaderboard(limit: number = 100): Promise<Leaderboard> {
  const entries: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 301,
      username: 'Петр К.',
      avatar: '🚀',
      value: 543,
      badge: '👑',
      trend: 'up'
    },
    {
      rank: 2,
      userId: 302,
      username: 'Анна Р.',
      avatar: '🚀',
      value: 487,
      badge: '🥈',
      trend: 'stable'
    },
    {
      rank: 3,
      userId: 303,
      username: 'Николай Б.',
      avatar: '🚀',
      value: 421,
      badge: '🥉',
      trend: 'up'
    }
  ];
  
  return {
    id: 'jobs_completed_all_time',
    title: '🎯 Лидерборд по выполненным работам',
    description: 'Топ работников по количеству выполненных работ',
    type: 'jobs_completed',
    period: 'all_time',
    entries: entries.slice(0, limit),
    lastUpdated: new Date()
  };
}

/**
 * Получение еженедельного лидерборда
 */
export async function getWeeklyLeaderboard(limit: number = 50): Promise<Leaderboard> {
  const entries: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 401,
      username: 'Виктор Ж.',
      avatar: '🔥',
      value: 12500,
      badge: '🔥',
      trend: 'up'
    },
    {
      rank: 2,
      userId: 402,
      username: 'Татьяна Г.',
      avatar: '🔥',
      value: 11200,
      trend: 'down'
    }
  ];
  
  return {
    id: 'earnings_weekly',
    title: '🔥 Еженедельный лидерборд',
    description: 'Топ работников за эту неделю',
    type: 'weekly',
    period: 'weekly',
    entries: entries.slice(0, limit),
    lastUpdated: new Date()
  };
}

/**
 * Получение ежемесячного лидерборда
 */
export async function getMonthlyLeaderboard(limit: number = 50): Promise<Leaderboard> {
  const entries: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 501,
      username: 'Максим Х.',
      avatar: '💎',
      value: 85000,
      badge: '💎',
      trend: 'stable'
    }
  ];
  
  return {
    id: 'earnings_monthly',
    title: '💎 Ежемесячный лидерборд',
    description: 'Топ работников за этот месяц',
    type: 'monthly',
    period: 'monthly',
    entries: entries.slice(0, limit),
    lastUpdated: new Date()
  };
}

/**
 * Получение позиции пользователя в лидербордах
 */
export async function getUserLeaderboardPosition(
  userId: number
): Promise<{
  earnings: { rank: number; value: number };
  rating: { rank: number; value: number };
  jobsCompleted: { rank: number; value: number };
}> {
  return {
    earnings: { rank: 42, value: 45000 },
    rating: { rank: 156, value: 4.75 },
    jobsCompleted: { rank: 89, value: 234 }
  };
}

/**
 * Получение всех лидербордов
 */
export async function getAllLeaderboards(): Promise<Leaderboard[]> {
  return [
    await getEarningsLeaderboard(10),
    await getRatingLeaderboard(10),
    await getJobsCompletedLeaderboard(10),
    await getWeeklyLeaderboard(10),
    await getMonthlyLeaderboard(10)
  ];
}

/**
 * Обновление лидербордов (периодическая задача)
 */
export async function updateLeaderboards(): Promise<void> {
  console.log('[Leaderboards] Updating all leaderboards...');
  
  // Здесь должна быть логика пересчета лидербордов из БД
  // Обычно это делается раз в час или раз в день
  
  console.log('[Leaderboards] Leaderboards updated successfully');
}

export const leaderboardsRouter = {
  getEarningsLeaderboard,
  getRatingLeaderboard,
  getJobsCompletedLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
  getUserLeaderboardPosition,
  getAllLeaderboards,
  updateLeaderboards
};
