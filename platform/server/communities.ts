/**
 * Communities & Groups System
 * Система сообществ и групп для обмена опытом
 */

export interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  members: number;
  createdBy: number;
  createdAt: Date;
  isPrivate: boolean;
  rules: string[];
}

export interface CommunityPost {
  id: number;
  communityId: number;
  userId: number;
  title: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: Date;
  edited: boolean;
}

export interface CommunityComment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  likes: number;
  createdAt: Date;
}

/**
 * Создание сообщества
 */
export async function createCommunity(
  name: string,
  description: string,
  category: string,
  createdBy: number,
  isPrivate: boolean = false
): Promise<Community> {
  const community: Community = {
    id: Math.random(),
    name,
    description,
    category,
    icon: getCategoryIcon(category),
    members: 1,
    createdBy,
    createdAt: new Date(),
    isPrivate,
    rules: getDefaultRules()
  };
  
  console.log(`[Community] Created: "${name}" by user ${createdBy}`);
  return community;
}

/**
 * Получение сообществ по категории
 */
export async function getCommunitiesByCategory(category: string): Promise<Community[]> {
  const communities: Community[] = [
    {
      id: 1,
      name: 'Курьеры России',
      description: 'Сообщество для курьеров и доставщиков',
      category: 'delivery',
      icon: '🚚',
      members: 2543,
      createdBy: 1,
      createdAt: new Date('2025-01-01'),
      isPrivate: false,
      rules: getDefaultRules()
    },
    {
      id: 2,
      name: 'Складская работа',
      description: 'Обмен опытом работы на складах',
      category: 'warehouse',
      icon: '📦',
      members: 1876,
      createdBy: 2,
      createdAt: new Date('2025-01-05'),
      isPrivate: false,
      rules: getDefaultRules()
    },
    {
      id: 3,
      name: 'Розница и продажи',
      description: 'Советы по продажам и работе в магазинах',
      category: 'retail',
      icon: '🛍️',
      members: 1234,
      createdBy: 3,
      createdAt: new Date('2025-01-10'),
      isPrivate: false,
      rules: getDefaultRules()
    }
  ];
  
  return communities.filter(c => c.category === category);
}

/**
 * Получение постов сообщества
 */
export async function getCommunityPosts(communityId: number, limit: number = 20): Promise<CommunityPost[]> {
  const posts: CommunityPost[] = [
    {
      id: 1,
      communityId,
      userId: 10,
      title: 'Как заработать больше денег курьером?',
      content: 'Поделитесь своими советами по увеличению заработков...',
      likes: 45,
      comments: 12,
      createdAt: new Date(),
      edited: false
    },
    {
      id: 2,
      communityId,
      userId: 20,
      title: 'Лучшие маршруты в Москве',
      content: 'Делюсь опытом работы на разных маршрутах...',
      likes: 78,
      comments: 23,
      createdAt: new Date(),
      edited: false
    }
  ];
  
  return posts.slice(0, limit);
}

/**
 * Создание поста в сообществе
 */
export async function createCommunityPost(
  communityId: number,
  userId: number,
  title: string,
  content: string
): Promise<CommunityPost> {
  const post: CommunityPost = {
    id: Math.random(),
    communityId,
    userId,
    title,
    content,
    likes: 0,
    comments: 0,
    createdAt: new Date(),
    edited: false
  };
  
  console.log(`[Community] New post in community ${communityId}: "${title}"`);
  return post;
}

/**
 * Добавление комментария к посту
 */
export async function addCommentToPost(
  postId: number,
  userId: number,
  content: string
): Promise<CommunityComment> {
  const comment: CommunityComment = {
    id: Math.random(),
    postId,
    userId,
    content,
    likes: 0,
    createdAt: new Date()
  };
  
  console.log(`[Community] New comment on post ${postId}`);
  return comment;
}

/**
 * Получение рекомендуемых сообществ для пользователя
 */
export async function getRecommendedCommunities(userId: number): Promise<Community[]> {
  // Здесь должна быть логика рекомендаций на основе интересов пользователя
  return [
    {
      id: 1,
      name: 'Курьеры России',
      description: 'Сообщество для курьеров и доставщиков',
      category: 'delivery',
      icon: '🚚',
      members: 2543,
      createdBy: 1,
      createdAt: new Date('2025-01-01'),
      isPrivate: false,
      rules: getDefaultRules()
    }
  ];
}

/**
 * Присоединение к сообществу
 */
export async function joinCommunity(communityId: number, userId: number): Promise<void> {
  console.log(`[Community] User ${userId} joined community ${communityId}`);
  // Сохранение в БД
}

/**
 * Покидание сообщества
 */
export async function leaveCommunity(communityId: number, userId: number): Promise<void> {
  console.log(`[Community] User ${userId} left community ${communityId}`);
  // Удаление из БД
}

/**
 * Получение иконки категории
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    delivery: '🚚',
    warehouse: '📦',
    retail: '🛍️',
    cleaning: '🧹',
    other: '💼'
  };
  return icons[category] || '💼';
}

/**
 * Получение правил сообщества по умолчанию
 */
function getDefaultRules(): string[] {
  return [
    'Будьте вежливы и уважительны',
    'Не спамьте и не публикуйте рекламу',
    'Не делитесь личной информацией',
    'Соблюдайте правила платформы',
    'Помогайте друг другу'
  ];
}

export const communitiesRouter = {
  createCommunity,
  getCommunitiesByCategory,
  getCommunityPosts,
  createCommunityPost,
  addCommentToPost,
  getRecommendedCommunities,
  joinCommunity,
  leaveCommunity
};
