/**
 * Task System - Online & Offline Tasks
 * Система задач - онлайн и офлайн выполнение
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'online' | 'offline';
  category: string;
  reward: number;
  timeLimit: number; // в минутах
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'available' | 'in_progress' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  requirements: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // в метрах
  };
}

export interface UserTask {
  userId: number;
  taskId: string;
  status: 'available' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
  startedAt?: Date;
  completedAt?: Date;
  reward: number;
  proof?: {
    type: 'photo' | 'video' | 'text' | 'screenshot';
    url: string;
  };
}

/**
 * Получить срочные задачи (здесь и сейчас)
 */
export async function getUrgentTasks(
  latitude?: number,
  longitude?: number,
  radius: number = 5000
): Promise<Task[]> {
  const now = new Date();
  
  return [
    {
      id: 'urgent_1',
      title: 'Доставка посылки срочно',
      description: 'Нужно срочно доставить посылку в центр города. Платим 500₽',
      type: 'offline',
      category: 'delivery',
      reward: 500,
      timeLimit: 60,
      difficulty: 'easy',
      status: 'available',
      createdAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000), // 1 час
      requirements: ['Велосипед или авто', 'Телефон'],
      location: latitude && longitude ? {
        latitude,
        longitude,
        radius
      } : undefined
    },
    {
      id: 'urgent_2',
      title: 'Помощь в магазине',
      description: 'Нужна помощь с разгрузкой товара. 4 часа работы, 800₽',
      type: 'offline',
      category: 'retail',
      reward: 800,
      timeLimit: 240,
      difficulty: 'medium',
      status: 'available',
      createdAt: now,
      expiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000), // 3 часа
      requirements: ['Физическая подготовка'],
      location: latitude && longitude ? {
        latitude,
        longitude,
        radius
      } : undefined
    },
    {
      id: 'online_1',
      title: 'Напишите текст для сайта',
      description: 'Нужно написать 500 слов о продукте. 1000₽',
      type: 'online',
      category: 'freelance',
      reward: 1000,
      timeLimit: 120,
      difficulty: 'medium',
      status: 'available',
      createdAt: now,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 часа
      requirements: ['Навыки писательства', 'Русский язык']
    },
    {
      id: 'online_2',
      title: 'Обзвоните клиентов',
      description: 'Обзвоните 20 клиентов и предложите услугу. 2000₽',
      type: 'online',
      category: 'sales',
      reward: 2000,
      timeLimit: 180,
      difficulty: 'hard',
      status: 'available',
      createdAt: now,
      expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 часов
      requirements: ['Коммуникативность', 'Телефон']
    }
  ];
}

/**
 * Получить задачи пользователя
 */
export async function getUserTasks(userId: number): Promise<UserTask[]> {
  return [
    {
      userId,
      taskId: 'urgent_1',
      status: 'in_progress',
      startedAt: new Date(Date.now() - 30 * 60 * 1000),
      reward: 500
    },
    {
      userId,
      taskId: 'online_1',
      status: 'completed',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 60 * 60 * 1000),
      reward: 1000,
      proof: {
        type: 'text',
        url: 'https://example.com/text.txt'
      }
    }
  ];
}

/**
 * Принять задачу
 */
export async function acceptTask(userId: number, taskId: string): Promise<UserTask> {
  console.log(`[TaskSystem] User ${userId} accepted task ${taskId}`);
  
  return {
    userId,
    taskId,
    status: 'accepted',
    startedAt: new Date(),
    reward: 500
  };
}

/**
 * Завершить задачу
 */
export async function completeTask(
  userId: number,
  taskId: string,
  proof?: {
    type: 'photo' | 'video' | 'text' | 'screenshot';
    url: string;
  }
): Promise<{ success: boolean; reward: number; message: string }> {
  console.log(`[TaskSystem] User ${userId} completed task ${taskId}`);
  
  return {
    success: true,
    reward: 500,
    message: 'Задача завершена! Деньги будут переведены в течение 5 минут'
  };
}

/**
 * Отклонить задачу
 */
export async function rejectTask(userId: number, taskId: string, reason: string): Promise<boolean> {
  console.log(`[TaskSystem] User ${userId} rejected task ${taskId}: ${reason}`);
  return true;
}

/**
 * Получить популярные категории задач
 */
export async function getPopularTaskCategories(): Promise<{
  category: string;
  count: number;
  avgReward: number;
  icon: string;
}[]> {
  return [
    {
      category: 'delivery',
      count: 245,
      avgReward: 450,
      icon: '🚚'
    },
    {
      category: 'retail',
      count: 189,
      avgReward: 600,
      icon: '🏪'
    },
    {
      category: 'freelance',
      count: 412,
      avgReward: 1200,
      icon: '💻'
    },
    {
      category: 'sales',
      count: 156,
      avgReward: 800,
      icon: '📱'
    },
    {
      category: 'services',
      count: 203,
      avgReward: 1000,
      icon: '🔧'
    }
  ];
}

export const taskSystemRouter = {
  getUrgentTasks,
  getUserTasks,
  acceptTask,
  completeTask,
  rejectTask,
  getPopularTaskCategories
};
