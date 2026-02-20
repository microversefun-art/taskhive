import { getDb } from "../db";
import { achievements, userLevels } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export type AchievementType = "first_order" | "orders_100" | "rating_5stars" | "referral_10" | "executor_verified" | "custom";
export type BadgeLevel = "bronze" | "silver" | "gold" | "platinum";

export interface AchievementConfig {
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  points: number;
  badge: BadgeLevel;
}

const ACHIEVEMENT_CONFIGS: Record<AchievementType, AchievementConfig> = {
  first_order: {
    type: "first_order",
    title: "Первый заказ",
    description: "Завершите первый заказ на платформе",
    icon: "🎯",
    points: 10,
    badge: "bronze",
  },
  orders_100: {
    type: "orders_100",
    title: "Сотня заказов",
    description: "Завершите 100 заказов",
    icon: "💯",
    points: 50,
    badge: "silver",
  },
  rating_5stars: {
    type: "rating_5stars",
    title: "Идеальный рейтинг",
    description: "Получите 5-звёздочный рейтинг",
    icon: "⭐",
    points: 30,
    badge: "gold",
  },
  referral_10: {
    type: "referral_10",
    title: "Десять рефералов",
    description: "Пригласите 10 друзей на платформу",
    icon: "👥",
    points: 40,
    badge: "gold",
  },
  executor_verified: {
    type: "executor_verified",
    title: "Верифицированный исполнитель",
    description: "Пройдите верификацию",
    icon: "✅",
    points: 20,
    badge: "silver",
  },
  custom: {
    type: "custom",
    title: "Кастомное достижение",
    description: "Специальное достижение",
    icon: "🏆",
    points: 0,
    badge: "platinum",
  },
};

export class AchievementsManager {
  /**
   * Выдать достижение пользователю
   */
  static async unlockAchievement(userId: number, type: AchievementType) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const config = ACHIEVEMENT_CONFIGS[type];

    // Проверить, есть ли уже это достижение
    const existing = await db
      .select()
      .from(achievements)
      .where(and(eq(achievements.userId, userId), eq(achievements.type, type)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Создать новое достижение
    const result = await db.insert(achievements).values({
      userId,
      type,
      title: config.title,
      description: config.description,
      icon: config.icon,
      points: config.points,
      badge: config.badge,
    });

    // Обновить уровень пользователя
    await this.updateUserLevel(userId);

    return { userId, achievementType: type, ...config };
  }

  /**
   * Обновить уровень пользователя на основе достижений
   */
  static async updateUserLevel(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Получить все достижения пользователя
    const userAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));

    // Рассчитать общие очки
    const totalPoints = userAchievements.reduce((sum, ach) => sum + (ach.points || 0), 0);
    const totalAchievements = userAchievements.length;

    // Рассчитать уровень (каждый уровень требует 100 очков)
    const level = Math.min(50, Math.floor(totalPoints / 100) + 1);

    // Обновить или создать запись уровня
    const existing = await db
      .select()
      .from(userLevels)
      .where(eq(userLevels.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userLevels)
        .set({
          level,
          totalPoints,
          totalAchievements,
          experience: totalPoints,
        })
        .where(eq(userLevels.userId, userId));
    } else {
      await db.insert(userLevels).values({
        userId,
        level,
        totalPoints,
        totalAchievements,
        experience: totalPoints,
      });
    }

    return { userId, level, totalPoints, totalAchievements };
  }

  /**
   * Получить достижения пользователя
   */
  static async getUserAchievements(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
  }

  /**
   * Получить уровень пользователя
   */
  static async getUserLevel(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(userLevels)
      .where(eq(userLevels.userId, userId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Получить лидерборд по уровням
   */
  static async getLeaderboardByLevel(limit = 100) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(userLevels)
      .orderBy(desc(userLevels.level), desc(userLevels.totalPoints))
      .limit(limit);
  }

  /**
   * Получить лидерборд по достижениям
   */
  static async getLeaderboardByAchievements(limit = 100) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(userLevels)
      .orderBy(desc(userLevels.totalAchievements), desc(userLevels.totalPoints))
      .limit(limit);
  }

  /**
   * Получить статистику достижений пользователя
   */
  static async getAchievementStats(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const level = await this.getUserLevel(userId);
    const userAchievements = await this.getUserAchievements(userId);

    return {
      userId,
      level: level?.level || 1,
      totalPoints: level?.totalPoints || 0,
      totalAchievements: userAchievements.length,
      achievements: userAchievements,
    };
  }
}
