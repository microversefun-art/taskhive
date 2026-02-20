import { getDb } from '../db';
import { z } from 'zod';

/**
 * Subscription Plans for TaskHive
 * Starter: 99₽/месяц - базовый доступ
 * Pro: 299₽/месяц - расширенный доступ
 * Enterprise: 999₽/месяц - полный доступ
 */

export const SubscriptionPlanEnum = z.enum(['starter', 'pro', 'enterprise', 'free']);
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanEnum>;

export const SubscriptionSchema = z.object({
  userId: z.string(),
  plan: SubscriptionPlanEnum,
  status: z.enum(['active', 'cancelled', 'expired', 'pending']),
  startDate: z.date(),
  endDate: z.date(),
  autoRenew: z.boolean(),
  paymentMethodId: z.string().optional(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

// Тарифные планы
const PLANS: Record<SubscriptionPlan, {
  name: string;
  price: number;
  currency: string;
  features: string[];
  limits: Record<string, number>;
  description: string;
}> = {
  free: {
    name: 'Бесплатный',
    price: 0,
    currency: 'RUB',
    description: 'Для новичков',
    features: [
      'Просмотр задач',
      'Базовый профиль',
      '1 активная задача',
      'Чат с заказчиком',
    ],
    limits: {
      activeTasks: 1,
      messagesPerDay: 10,
      profileViews: 50,
      applicationsPerDay: 5,
    },
  },
  starter: {
    name: 'Стартер',
    price: 99,
    currency: 'RUB',
    description: 'Для активных исполнителей',
    features: [
      'Просмотр всех задач',
      'Расширенный профиль',
      '5 активных задач',
      'Приоритет в поиске',
      'Статистика доходов',
      'Рекомендации задач',
      'Поддержка по email',
    ],
    limits: {
      activeTasks: 5,
      messagesPerDay: 100,
      profileViews: 500,
      applicationsPerDay: 20,
      withdrawalPerMonth: 10,
    },
  },
  pro: {
    name: 'Профессионал',
    price: 299,
    currency: 'RUB',
    description: 'Для опытных исполнителей',
    features: [
      'Все из Стартер',
      '20 активных задач',
      'Премиум профиль',
      'Приоритет в поиске (топ)',
      'Расширенная аналитика',
      'AI рекомендации',
      'Верификация профиля',
      'Приоритетная поддержка',
      'Экспорт отчётов',
    ],
    limits: {
      activeTasks: 20,
      messagesPerDay: 500,
      profileViews: 5000,
      applicationsPerDay: 50,
      withdrawalPerMonth: 50,
      reportExports: 10,
    },
  },
  enterprise: {
    name: 'Предприятие',
    price: 999,
    currency: 'RUB',
    description: 'Для команд и агентств',
    features: [
      'Все из Профессионал',
      'Неограниченные задачи',
      'Команда (до 10 человек)',
      'Белый лейбл профиля',
      'API доступ',
      'Интеграция с 1С',
      'Личный менеджер',
      'Приоритет в поддержке (24/7)',
      'Кастомные отчёты',
      'Аналитика в реальном времени',
    ],
    limits: {
      activeTasks: 999,
      messagesPerDay: 9999,
      profileViews: 99999,
      applicationsPerDay: 999,
      withdrawalPerMonth: 999,
      reportExports: 999,
      teamMembers: 10,
    },
  },
};

export class SubscriptionManager {
  /**
   * Получить информацию о плане
   */
  static getPlanInfo(plan: SubscriptionPlan) {
    return PLANS[plan];
  }

  /**
   * Создать подписку
   */
  static async createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    paymentMethodId?: string
  ): Promise<Subscription> {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 дней

    const subscription: Subscription = {
      userId,
      plan,
      status: 'active',
      startDate: now,
      endDate,
      autoRenew: true,
      paymentMethodId,
    };

    // TODO: Сохранить в БД
    return subscription;
  }

  /**
   * Получить активную подписку пользователя
   */
  static async getActiveSubscription(userId: string): Promise<Subscription | null> {
    // TODO: Получить из БД
    return null;
  }

  /**
   * Проверить, есть ли доступ к функции
   */
  static async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    if (!subscription) return feature === 'basic';

    const planInfo = PLANS[subscription.plan];
    return planInfo.features.includes(feature);
  }

  /**
   * Проверить лимит
   */
  static async checkLimit(userId: string, limitName: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    if (!subscription) return false;

    const planInfo = PLANS[subscription.plan];
    const limit = planInfo.limits[limitName];
    
    if (!limit) return true;
    if (limit === 999) return true; // Неограниченно

    // TODO: Проверить текущее использование
    return true;
  }

  /**
   * Отменить подписку
   */
  static async cancelSubscription(userId: string): Promise<void> {
    // TODO: Обновить в БД
  }

  /**
   * Продлить подписку
   */
  static async renewSubscription(userId: string): Promise<Subscription | null> {
    const subscription = await this.getActiveSubscription(userId);
    if (!subscription) return null;

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // TODO: Обновить в БД
    return {
      ...subscription,
      startDate: now,
      endDate,
      status: 'active',
    };
  }

  /**
   * Получить все планы
   */
  static getAllPlans(): Record<SubscriptionPlan, typeof PLANS[SubscriptionPlan]> {
    return PLANS;
  }

  /**
   * Рассчитать стоимость для пользователя
   */
  static calculatePrice(plan: SubscriptionPlan, discountPercent = 0): number {
    const basePrice = PLANS[plan].price;
    return Math.round(basePrice * (1 - discountPercent / 100));
  }

  /**
   * Получить рекомендуемый план для пользователя
   */
  static async getRecommendedPlan(userId: string): Promise<SubscriptionPlan> {
    // TODO: Анализировать активность пользователя и рекомендовать план
    return 'starter';
  }
}

// tRPC процедуры для подписок
export const subscriptionProcedures = {
  getPlans: () => {
    return SubscriptionManager.getAllPlans();
  },

  getCurrentSubscription: async (userId: string) => {
    return SubscriptionManager.getActiveSubscription(userId);
  },

  upgradePlan: async (userId: string, newPlan: SubscriptionPlan) => {
    const oldSubscription = await SubscriptionManager.getActiveSubscription(userId);
    
    // Отменить старую подписку
    if (oldSubscription) {
      await SubscriptionManager.cancelSubscription(userId);
    }

    // Создать новую
    return SubscriptionManager.createSubscription(userId, newPlan);
  },

  cancelSubscription: async (userId: string) => {
    await SubscriptionManager.cancelSubscription(userId);
    return { success: true };
  },

  checkFeatureAccess: async (userId: string, feature: string) => {
    const hasAccess = await SubscriptionManager.hasFeatureAccess(userId, feature);
    return { hasAccess };
  },

  getRecommendedPlan: async (userId: string) => {
    const plan = await SubscriptionManager.getRecommendedPlan(userId);
    return { plan, info: SubscriptionManager.getPlanInfo(plan) };
  },
};
