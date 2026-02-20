import { getDb } from "../db";
import { recommendations, userInteractions, jobs } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export type RecommendationType = "executor" | "client";

export interface RecommendationScore {
  jobId: number;
  score: number;
  reason: string;
}

export class RecommendationsEngine {
  /**
   * Сгенерировать рекомендации для исполнителя
   */
  static async generateExecutorRecommendations(userId: number, limit = 5) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Получить активные вакансии
    const activeJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, "active"))
      .limit(limit * 2);

    // Рассчитать скор для каждой вакансии
    const recommendationsScores: RecommendationScore[] = [];

    for (const job of activeJobs) {
      // Базовый скор (0-100)
      let score = 50;

      // Бонус за горячие вакансии
      if (job.isHot) score += 20;

      // Штраф за мошенничество
      if (job.isFraud) score -= 30;

      // Бонус за популярность
      if (job.viewCount && job.viewCount > 100) score += 10;

      recommendationsScores.push({
        jobId: job.id,
        score: Math.min(100, Math.max(0, score)),
        reason: `Рекомендация на основе активности и популярности`,
      });
    }

    // Отсортировать по скору
    recommendationsScores.sort((a, b) => b.score - a.score);

    // Сохранить рекомендации в БД
    const result = [];
    for (const rec of recommendationsScores.slice(0, limit)) {
      const existing = await db
        .select()
        .from(recommendations)
        .where(
          and(
            eq(recommendations.userId, userId),
            eq(recommendations.jobId, rec.jobId)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(recommendations as any).values({
          userId,
          jobId: rec.jobId,
          type: "executor",
          score: rec.score.toString(),
          reason: rec.reason,
        });
      }

      result.push(rec);
    }

    return result;
  }

  /**
   * Сгенерировать рекомендации для клиента
   */
  static async generateClientRecommendations(userId: number, jobId: number, limit = 5) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Получить информацию о текущей вакансии
    const currentJob = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (currentJob.length === 0) {
      return [];
    }

    const job = currentJob[0];

    // Получить похожие вакансии по категории
    const similarJobs = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.category, job.category),
          eq(jobs.status, "active")
        )
      )
      .limit(limit * 2);

    // Рассчитать скор для каждой вакансии
    const recommendationsScores: RecommendationScore[] = [];

    for (const similarJob of similarJobs) {
      if (similarJob.id === jobId) continue; // Пропустить текущую вакансию

      let score = 60; // Базовый скор за совпадение категории

      // Бонус за похожую зарплату
      if (job.salary && similarJob.salary) {
        const priceDiff = Math.abs(job.salary - similarJob.salary);
        if (priceDiff < job.salary * 0.2) score += 15; // В пределах 20%
      }

      // Бонус за горячие вакансии
      if (similarJob.isHot) score += 10;

      recommendationsScores.push({
        jobId: similarJob.id,
        score: Math.min(100, score),
        reason: `Похожая вакансия в категории ${job.category}`,
      });
    }

    // Отсортировать по скору
    recommendationsScores.sort((a, b) => b.score - a.score);

    return recommendationsScores.slice(0, limit);
  }

  /**
   * Получить рекомендации пользователя
   */
  static async getUserRecommendations(userId: number, type: RecommendationType) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(recommendations)
      .where(
        and(
          eq(recommendations.userId, userId),
          eq(recommendations.type, type)
        )
      )
      .orderBy(desc(recommendations.score));
  }

  /**
   * Отметить рекомендацию как просмотренную
   */
  static async markAsClicked(recommendationId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(recommendations)
      .set({ clicked: true, clickedAt: new Date() })
      .where(eq(recommendations.id, recommendationId));

    return { success: true };
  }

  /**
   * Отметить рекомендацию как применённую
   */
  static async markAsApplied(recommendationId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(recommendations)
      .set({ applied: true, appliedAt: new Date() })
      .where(eq(recommendations.id, recommendationId));

    return { success: true };
  }

  /**
   * Получить статистику рекомендаций пользователя
   */
  static async getStats(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allRecs = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.userId, userId));

    const clickedCount = allRecs.filter((r) => r.clicked).length;
    const appliedCount = allRecs.filter((r) => r.applied).length;

    return {
      userId,
      totalRecommendations: allRecs.length,
      clickedCount,
      appliedCount,
      clickRate: allRecs.length > 0 ? (clickedCount / allRecs.length) * 100 : 0,
      conversionRate: clickedCount > 0 ? (appliedCount / clickedCount) * 100 : 0,
    };
  }
}
