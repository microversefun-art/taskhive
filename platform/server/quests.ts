/**
 * Quests & Achievements System
 * Система квестов и достижений для gamification
 */

export interface Quest {
  id: number;
  title: string;
  description: string;
  type: 'jobs' | 'rating' | 'earnings' | 'referral' | 'community';
  target: number; // цель (5 работ, 5 звезд, 5000₽)
  reward: {
    xp: number;
    bonus: number;
    badge?: string;
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  icon: string;
  expiresIn?: number; // дни
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface UserProgress {
  userId: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  completedQuests: number[];
  achievements: Achievement[];
  totalXp: number;
}

/**
 * Получение доступных квестов для пользователя
 */
export async function getAvailableQuests(userId: number): Promise<Quest[]> {
  const quests: Quest[] = [
    {
      id: 1,
      title: '🚀 Первые шаги',
      description: 'Выполните 5 работ',
      type: 'jobs',
      target: 5,
      reward: { xp: 100, bonus: 500 },
      difficulty: 'easy',
      icon: '🚀'
    },
    {
      id: 2,
      title: '⭐ Звездный путь',
      description: 'Получите рейтинг 5 звезд',
      type: 'rating',
      target: 5,
      reward: { xp: 250, bonus: 1000, badge: 'star_master' },
      difficulty: 'medium',
      icon: '⭐'
    },
    {
      id: 3,
      title: '💰 Финансист',
      description: 'Заработайте 5000₽',
      type: 'earnings',
      target: 5000,
      reward: { xp: 200, bonus: 500 },
      difficulty: 'medium',
      icon: '💰'
    },
    {
      id: 4,
      title: '👥 Социальная бабочка',
      description: 'Пригласите 3 друзей',
      type: 'referral',
      target: 3,
      reward: { xp: 300, bonus: 1500, badge: 'social_butterfly' },
      difficulty: 'hard',
      icon: '👥'
    },
    {
      id: 5,
      title: '🏆 Легенда',
      description: 'Выполните 50 работ',
      type: 'jobs',
      target: 50,
      reward: { xp: 500, bonus: 5000, badge: 'legend' },
      difficulty: 'epic',
      icon: '🏆'
    }
  ];
  
  return quests;
}

/**
 * Проверка прогресса квеста
 */
export async function checkQuestProgress(
  userId: number,
  questId: number,
  currentProgress: number
): Promise<{ completed: boolean; reward?: { xp: number; bonus: number } }> {
  const quests = await getAvailableQuests(userId);
  const quest = quests.find(q => q.id === questId);
  
  if (!quest) {
    return { completed: false };
  }
  
  const completed = currentProgress >= quest.target;
  
  if (completed) {
    // Добавить награды пользователю
    await grantQuestReward(userId, quest);
    return { completed: true, reward: quest.reward };
  }
  
  return { completed: false };
}

/**
 * Выдача награды за квест
 */
async function grantQuestReward(userId: number, quest: Quest): Promise<void> {
  console.log(`[Quest] User ${userId} completed quest "${quest.title}"`);
  console.log(`[Quest] Reward: ${quest.reward.xp} XP + ${quest.reward.bonus}₽`);
  
  // Сохранение в БД
  // await db.insert(userRewards).values({...})
}

/**
 * Получение прогресса пользователя
 */
export async function getUserProgress(userId: number): Promise<UserProgress> {
  // Здесь должна быть логика получения данных из БД
  return {
    userId,
    level: 5,
    xp: 1250,
    nextLevelXp: 2000,
    completedQuests: [1, 2, 3],
    achievements: [
      {
        id: 1,
        title: 'Первые шаги',
        description: 'Выполните 5 работ',
        icon: '🚀',
        rarity: 'common',
        unlockedAt: new Date(),
        progress: 5,
        maxProgress: 5
      },
      {
        id: 2,
        title: 'Звездный путь',
        description: 'Получите рейтинг 5 звезд',
        icon: '⭐',
        rarity: 'rare',
        unlockedAt: new Date(),
        progress: 5,
        maxProgress: 5
      }
    ],
    totalXp: 1250
  };
}

/**
 * Система уровней
 */
export function calculateLevel(totalXp: number): { level: number; xpInLevel: number; nextLevelXp: number } {
  const baseXp = 1000;
  const xpMultiplier = 1.1;
  
  let level = 1;
  let xpForLevel = baseXp;
  let totalXpForLevel = 0;
  
  while (totalXp >= totalXpForLevel + xpForLevel && level < 50) {
    totalXpForLevel += xpForLevel;
    level++;
    xpForLevel = Math.floor(baseXp * Math.pow(xpMultiplier, level - 1));
  }
  
  const xpInLevel = totalXp - totalXpForLevel;
  const nextLevelXp = xpForLevel;
  
  return { level, xpInLevel, nextLevelXp };
}

/**
 * Получение бейджей пользователя
 */
export async function getUserBadges(userId: number): Promise<string[]> {
  // Здесь должна быть логика получения бейджей из БД
  return ['star_master', 'social_butterfly', 'legend'];
}

/**
 * Добавление XP пользователю
 */
export async function addUserXp(userId: number, xpAmount: number): Promise<UserProgress> {
  console.log(`[XP] User ${userId} gained ${xpAmount} XP`);
  
  // Обновление в БД и возврат нового прогресса
  return await getUserProgress(userId);
}

export const questsRouter = {
  getAvailableQuests,
  checkQuestProgress,
  getUserProgress,
  calculateLevel,
  getUserBadges,
  addUserXp
};
