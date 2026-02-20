/**
 * Business Boxes & Career Paths System
 * Система боксов-стартеров и карьерных путей
 */

export interface BusinessBox {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  price: number; // цена за доступ к боксу
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // в часах
  category: 'delivery' | 'retail' | 'services' | 'freelance' | 'sales' | 'tech';
  tasks: BoxTask[];
  rewards: {
    totalEarnings: number;
    certificate: boolean;
    badge: string;
  };
  successRate: number; // процент успешно завершивших
  reviews: number;
  rating: number;
}

export interface BoxTask {
  id: string;
  title: string;
  description: string;
  type: 'online' | 'offline' | 'hybrid';
  difficulty: 'easy' | 'medium' | 'hard';
  reward: number; // зарплата за выполнение
  timeLimit: number; // в минутах
  requirements: string[];
  tips: string[];
  completed?: boolean;
  completedAt?: Date;
}

export interface UserBoxProgress {
  userId: number;
  boxId: string;
  startedAt: Date;
  completedAt?: Date;
  progress: number; // процент завершения
  tasksCompleted: number;
  totalTasks: number;
  earnings: number;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface SelfEmploymentStatus {
  userId: number;
  level: number; // уровень самозанятости (1-5)
  monthlyEarnings: number;
  completedBoxes: number;
  clientRating: number;
  status: 'employee' | 'freelancer' | 'entrepreneur' | 'business_owner';
  nextMilestone: {
    name: string;
    requirement: string;
    progress: number;
  };
}

/**
 * Получение всех доступных боксов
 */
export async function getAllBusinessBoxes(): Promise<BusinessBox[]> {
  return [
    {
      id: 'delivery_starter',
      name: '🚚 Курьер-стартер',
      description: 'Начните зарабатывать как курьер. Доставляйте посылки и получайте 100-300₽ за доставку',
      icon: '🚚',
      color: '#FF6B6B',
      price: 0,
      difficulty: 'beginner',
      estimatedTime: 40,
      category: 'delivery',
      tasks: [
        {
          id: 'delivery_1',
          title: 'Первая доставка',
          description: 'Выполните первую доставку в вашем районе',
          type: 'offline',
          difficulty: 'easy',
          reward: 150,
          timeLimit: 120,
          requirements: ['Велосипед или авто', 'Телефон'],
          tips: ['Используйте навигацию', 'Проверьте адрес перед доставкой'],
          completed: false
        },
        {
          id: 'delivery_2',
          title: '5 доставок за день',
          description: 'Выполните 5 доставок в течение одного дня',
          type: 'offline',
          difficulty: 'medium',
          reward: 500,
          timeLimit: 480,
          requirements: ['Опыт из первой задачи'],
          tips: ['Планируйте маршрут', 'Начните с утра'],
          completed: false
        },
        {
          id: 'delivery_3',
          title: 'Получите 5 звезд',
          description: 'Получите рейтинг 5.0 за 10 доставок',
          type: 'offline',
          difficulty: 'hard',
          reward: 1000,
          timeLimit: 1440,
          requirements: ['10 успешных доставок'],
          tips: ['Будьте вежливы', 'Доставляйте быстро и аккуратно'],
          completed: false
        }
      ],
      rewards: {
        totalEarnings: 1650,
        certificate: true,
        badge: '🚚_starter'
      },
      successRate: 78,
      reviews: 2341,
      rating: 4.7
    },
    {
      id: 'retail_starter',
      name: '🏪 Продавец-стартер',
      description: 'Работайте в розницу. Помогайте клиентам и зарабатывайте 200-400₽ за смену',
      icon: '🏪',
      color: '#4ECDC4',
      price: 0,
      difficulty: 'beginner',
      estimatedTime: 50,
      category: 'retail',
      tasks: [
        {
          id: 'retail_1',
          title: 'Первая смена',
          description: 'Отработайте первую 4-часовую смену в магазине',
          type: 'offline',
          difficulty: 'easy',
          reward: 200,
          timeLimit: 240,
          requirements: ['Приличный внешний вид'],
          tips: ['Приходите за 15 минут до смены', 'Слушайте инструкции'],
          completed: false
        },
        {
          id: 'retail_2',
          title: '5 смен подряд',
          description: 'Отработайте 5 смен подряд без прогулов',
          type: 'offline',
          difficulty: 'medium',
          reward: 1000,
          timeLimit: 1440,
          requirements: ['1 смена опыта'],
          tips: ['Будьте пунктуальны', 'Помогайте коллегам'],
          completed: false
        }
      ],
      rewards: {
        totalEarnings: 1200,
        certificate: true,
        badge: '🏪_starter'
      },
      successRate: 82,
      reviews: 1856,
      rating: 4.8
    },
    {
      id: 'freelance_starter',
      name: '💻 Фрилансер-стартер',
      description: 'Выполняйте задачи онлайн. Дизайн, писательство, программирование. 500-5000₽ за задачу',
      icon: '💻',
      color: '#95E1D3',
      price: 0,
      difficulty: 'intermediate',
      estimatedTime: 60,
      category: 'freelance',
      tasks: [
        {
          id: 'freelance_1',
          title: 'Первая задача',
          description: 'Выполните первую фрилансовую задачу на платформе',
          type: 'online',
          difficulty: 'easy',
          reward: 500,
          timeLimit: 1440,
          requirements: ['Портфолио или примеры работ'],
          tips: ['Выбирайте задачу по своим навыкам', 'Общайтесь с заказчиком'],
          completed: false
        },
        {
          id: 'freelance_2',
          title: '5 успешных проектов',
          description: 'Завершите 5 проектов с рейтингом 4.5+',
          type: 'online',
          difficulty: 'hard',
          reward: 2500,
          timeLimit: 2880,
          requirements: ['1 проект опыта'],
          tips: ['Соблюдайте сроки', 'Запрашивайте отзывы'],
          completed: false
        }
      ],
      rewards: {
        totalEarnings: 3000,
        certificate: true,
        badge: '💻_starter'
      },
      successRate: 71,
      reviews: 3124,
      rating: 4.6
    },
    {
      id: 'sales_starter',
      name: '📱 Продавец услуг',
      description: 'Продавайте услуги и товары. Телемаркетинг, консультации. 300-1000₽ за продажу',
      icon: '📱',
      color: '#F38181',
      price: 99,
      difficulty: 'intermediate',
      estimatedTime: 45,
      category: 'sales',
      tasks: [
        {
          id: 'sales_1',
          title: 'Первая продажа',
          description: 'Совершите первую продажу услуги или товара',
          type: 'hybrid',
          difficulty: 'medium',
          reward: 300,
          timeLimit: 1440,
          requirements: ['Коммуникативность'],
          tips: ['Слушайте клиента', 'Предложите решение'],
          completed: false
        },
        {
          id: 'sales_2',
          title: '10 продаж за неделю',
          description: 'Совершите 10 продаж за одну неделю',
          type: 'hybrid',
          difficulty: 'hard',
          reward: 2000,
          timeLimit: 10080,
          requirements: ['1 продажа опыта'],
          tips: ['Будьте настойчивы', 'Следите за конверсией'],
          completed: false
        }
      ],
      rewards: {
        totalEarnings: 2300,
        certificate: true,
        badge: '📱_starter'
      },
      successRate: 65,
      reviews: 987,
      rating: 4.5
    },
    {
      id: 'services_starter',
      name: '🔧 Мастер услуг',
      description: 'Предоставляйте услуги. Ремонт, уборка, консультации. 500-2000₽ за услугу',
      icon: '🔧',
      color: '#FFD93D',
      price: 199,
      difficulty: 'intermediate',
      estimatedTime: 55,
      category: 'services',
      tasks: [
        {
          id: 'services_1',
          title: 'Первая услуга',
          description: 'Предоставьте первую услугу клиенту',
          type: 'offline',
          difficulty: 'medium',
          reward: 500,
          timeLimit: 1440,
          requirements: ['Навыки в выбранной области'],
          tips: ['Будьте профессиональны', 'Используйте инструменты'],
          completed: false
        }
      ],
      rewards: {
        totalEarnings: 2500,
        certificate: true,
        badge: '🔧_starter'
      },
      successRate: 73,
      reviews: 1543,
      rating: 4.7
    }
  ];
}

/**
 * Получение боксов пользователя
 */
export async function getUserBoxes(userId: number): Promise<UserBoxProgress[]> {
  return [
    {
      userId,
      boxId: 'delivery_starter',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: undefined,
      progress: 66,
      tasksCompleted: 2,
      totalTasks: 3,
      earnings: 650,
      status: 'in_progress'
    }
  ];
}

/**
 * Получение статуса самозанятости пользователя
 */
export async function getUserSelfEmploymentStatus(userId: number): Promise<SelfEmploymentStatus> {
  return {
    userId,
    level: 2,
    monthlyEarnings: 15000,
    completedBoxes: 1,
    clientRating: 4.8,
    status: 'freelancer',
    nextMilestone: {
      name: 'Предприниматель',
      requirement: 'Завершить 5 боксов и заработать 50000₽',
      progress: 30
    }
  };
}

/**
 * Начать новый бокс
 */
export async function startBusinessBox(userId: number, boxId: string): Promise<UserBoxProgress> {
  console.log(`[BusinessBox] User ${userId} started box ${boxId}`);
  
  return {
    userId,
    boxId,
    startedAt: new Date(),
    progress: 0,
    tasksCompleted: 0,
    totalTasks: 3,
    earnings: 0,
    status: 'in_progress'
  };
}

/**
 * Завершить задачу в боксе
 */
export async function completeBoxTask(
  userId: number,
  boxId: string,
  taskId: string,
  reward: number
): Promise<{ success: boolean; totalEarnings: number; levelUp?: boolean }> {
  console.log(`[BusinessBox] User ${userId} completed task ${taskId} in box ${boxId}, earned ${reward}₽`);
  
  return {
    success: true,
    totalEarnings: reward,
    levelUp: false
  };
}

/**
 * Получить рекомендованные боксы для пользователя
 */
export async function getRecommendedBoxes(userId: number): Promise<BusinessBox[]> {
  const allBoxes = await getAllBusinessBoxes();
  
  // Рекомендуем боксы на основе интересов пользователя
  return allBoxes.slice(0, 3);
}

export const businessBoxesRouter = {
  getAllBusinessBoxes,
  getUserBoxes,
  getUserSelfEmploymentStatus,
  startBusinessBox,
  completeBoxTask,
  getRecommendedBoxes
};
