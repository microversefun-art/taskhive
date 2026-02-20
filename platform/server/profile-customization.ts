/**
 * Profile Customization & Badge Collection
 * Кастомизация профиля и коллекция бейджей
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  unlockedAt?: Date;
}

export interface ProfileCustomization {
  userId: number;
  avatar: string;
  background: string;
  theme: 'light' | 'dark' | 'custom';
  customColor?: string;
  bio: string;
  badges: string[]; // IDs выбранных бейджей
  pinnedBadges: string[]; // Закрепленные бейджи (макс 3)
  theme_variant?: 'gradient' | 'solid' | 'pattern';
}

export interface AvatarOption {
  id: string;
  name: string;
  image: string;
  rarity: 'free' | 'premium' | 'exclusive';
  price?: number;
}

export interface BackgroundOption {
  id: string;
  name: string;
  image: string;
  rarity: 'free' | 'premium' | 'exclusive';
  price?: number;
}

/**
 * Получение всех доступных бейджей
 */
export async function getAllBadges(): Promise<Badge[]> {
  return [
    // Common badges
    {
      id: 'first_job',
      name: '🎯 Первая работа',
      description: 'Выполнили первую работу',
      icon: '🎯',
      rarity: 'common',
      requirement: 'Complete 1 job'
    },
    {
      id: 'five_stars',
      name: '⭐ Пятизвездный',
      description: 'Получили 5 пятизвездных оценок',
      icon: '⭐',
      rarity: 'common',
      requirement: 'Get 5 five-star ratings'
    },
    {
      id: 'ten_jobs',
      name: '💼 Опытный',
      description: 'Выполнили 10 работ',
      icon: '💼',
      rarity: 'uncommon',
      requirement: 'Complete 10 jobs'
    },
    // Uncommon badges
    {
      id: 'fast_worker',
      name: '⚡ Быстрый работник',
      description: 'Завершили работу за 1 час',
      icon: '⚡',
      rarity: 'uncommon',
      requirement: 'Complete job in 1 hour'
    },
    {
      id: 'team_player',
      name: '🤝 Командный игрок',
      description: 'Выполнили 5 командных работ',
      icon: '🤝',
      rarity: 'uncommon',
      requirement: 'Complete 5 team jobs'
    },
    // Rare badges
    {
      id: 'fifty_jobs',
      name: '🏆 Профессионал',
      description: 'Выполнили 50 работ',
      icon: '🏆',
      rarity: 'rare',
      requirement: 'Complete 50 jobs'
    },
    {
      id: 'month_king',
      name: '👑 Король месяца',
      description: 'Заработали 50000₽ за месяц',
      icon: '👑',
      rarity: 'rare',
      requirement: 'Earn 50000₽ in a month'
    },
    // Epic badges
    {
      id: 'legendary_worker',
      name: '🌟 Легендарный работник',
      description: 'Выполнили 200 работ',
      icon: '🌟',
      rarity: 'epic',
      requirement: 'Complete 200 jobs'
    },
    {
      id: 'referral_master',
      name: '🎁 Мастер рефералов',
      description: 'Пригласили 50 рефералов',
      icon: '🎁',
      rarity: 'epic',
      requirement: 'Refer 50 users'
    },
    // Legendary badges
    {
      id: 'ultimate_legend',
      name: '💎 Легенда платформы',
      description: 'Заработали 1000000₽',
      icon: '💎',
      rarity: 'legendary',
      requirement: 'Earn 1000000₽'
    }
  ];
}

/**
 * Получение бейджей пользователя
 */
export async function getUserBadges(userId: number): Promise<Badge[]> {
  const allBadges = await getAllBadges();
  
  // Имитация: пользователь разблокировал несколько бейджей
  const unlockedIds = ['first_job', 'five_stars', 'ten_jobs', 'fast_worker'];
  
  return allBadges
    .filter(b => unlockedIds.includes(b.id))
    .map(b => ({
      ...b,
      unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    }));
}

/**
 * Получение доступных аватаров
 */
export async function getAvailableAvatars(): Promise<AvatarOption[]> {
  return [
    {
      id: 'avatar_1',
      name: 'Синий герой',
      image: '🧑‍💼',
      rarity: 'free'
    },
    {
      id: 'avatar_2',
      name: 'Красный герой',
      image: '👨‍💻',
      rarity: 'free'
    },
    {
      id: 'avatar_3',
      name: 'Зеленый герой',
      image: '🧑‍🔧',
      rarity: 'free'
    },
    {
      id: 'avatar_premium_1',
      name: 'Золотой герой',
      image: '👑',
      rarity: 'premium',
      price: 99
    },
    {
      id: 'avatar_premium_2',
      name: 'Серебряный герой',
      image: '⭐',
      rarity: 'premium',
      price: 99
    },
    {
      id: 'avatar_exclusive_1',
      name: 'Легендарный герой',
      image: '💎',
      rarity: 'exclusive',
      price: 499
    }
  ];
}

/**
 * Получение доступных фонов профиля
 */
export async function getAvailableBackgrounds(): Promise<BackgroundOption[]> {
  return [
    {
      id: 'bg_1',
      name: 'Синий градиент',
      image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      rarity: 'free'
    },
    {
      id: 'bg_2',
      name: 'Зеленый градиент',
      image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      rarity: 'free'
    },
    {
      id: 'bg_3',
      name: 'Оранжевый градиент',
      image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      rarity: 'free'
    },
    {
      id: 'bg_premium_1',
      name: 'Премиум фиолетовый',
      image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      rarity: 'premium',
      price: 149
    },
    {
      id: 'bg_premium_2',
      name: 'Премиум золотой',
      image: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
      rarity: 'premium',
      price: 149
    },
    {
      id: 'bg_exclusive_1',
      name: 'Эксклюзивный радужный',
      image: 'linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta)',
      rarity: 'exclusive',
      price: 499
    }
  ];
}

/**
 * Получение кастомизации профиля пользователя
 */
export async function getUserProfileCustomization(userId: number): Promise<ProfileCustomization> {
  return {
    userId,
    avatar: '👨‍💼',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    theme: 'dark',
    customColor: '#667eea',
    bio: 'Опытный работник с рейтингом 4.9 ⭐',
    badges: ['first_job', 'five_stars', 'ten_jobs'],
    pinnedBadges: ['five_stars', 'ten_jobs'],
    theme_variant: 'gradient'
  };
}

/**
 * Обновление кастомизации профиля
 */
export async function updateProfileCustomization(
  userId: number,
  customization: Partial<ProfileCustomization>
): Promise<ProfileCustomization> {
  console.log(`[Profile] Updated customization for user ${userId}:`, customization);
  
  const current = await getUserProfileCustomization(userId);
  return { ...current, ...customization };
}

/**
 * Установка закрепленных бейджей
 */
export async function setPinnedBadges(userId: number, badgeIds: string[]): Promise<string[]> {
  if (badgeIds.length > 3) {
    throw new Error('Maximum 3 badges can be pinned');
  }
  
  console.log(`[Profile] User ${userId} pinned badges:`, badgeIds);
  return badgeIds;
}

/**
 * Получение профиля для просмотра другими пользователями
 */
export async function getPublicProfile(userId: number): Promise<{
  userId: number;
  username: string;
  avatar: string;
  background: string;
  bio: string;
  rating: number;
  completedJobs: number;
  pinnedBadges: Badge[];
  level: number;
}> {
  const customization = await getUserProfileCustomization(userId);
  const badges = await getUserBadges(userId);
  const pinnedBadges = badges.filter(b => customization.pinnedBadges.includes(b.id));
  
  return {
    userId,
    username: 'User ' + userId,
    avatar: customization.avatar,
    background: customization.background,
    bio: customization.bio,
    rating: 4.8,
    completedJobs: 42,
    pinnedBadges,
    level: 5
  };
}

export const profileCustomizationRouter = {
  getAllBadges,
  getUserBadges,
  getAvailableAvatars,
  getAvailableBackgrounds,
  getUserProfileCustomization,
  updateProfileCustomization,
  setPinnedBadges,
  getPublicProfile
};
