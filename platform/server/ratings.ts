import { z } from "zod";

/**
 * Модуль для управления рейтингами и отзывами
 */

export const ratingSchema = z.object({
  id: z.number().optional(),
  jobId: z.number(),
  reviewerId: z.number(), // ID того, кто оставляет отзыв
  targetId: z.number(), // ID того, на кого отзыв (работник или работодатель)
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  comment: z.string().min(10).max(1000),
  categories: z.object({
    professionalism: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    reliability: z.number().min(1).max(5),
    quality: z.number().min(1).max(5),
  }),
  photos: z.array(z.string()).optional(),
  isAnonymous: z.boolean().default(false),
  isVerified: z.boolean().default(true),
  helpful: z.number().default(0),
  unhelpful: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Rating = z.infer<typeof ratingSchema>;

/**
 * Вычисляет среднюю оценку из массива рейтингов
 */
export function calculateAverageRating(ratings: Rating[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

/**
 * Вычисляет распределение оценок
 */
export function getRatingDistribution(
  ratings: Rating[]
): Record<number, number> {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  ratings.forEach((rating) => {
    distribution[rating.rating]++;
  });

  return distribution;
}

/**
 * Форматирует рейтинг для отображения
 */
export function formatRating(rating: number): string {
  return `${rating.toFixed(1)} ⭐`;
}

/**
 * Получает описание рейтинга
 */
export function getRatingDescription(rating: number): string {
  if (rating >= 4.5) return "Отличный работник";
  if (rating >= 4) return "Хороший работник";
  if (rating >= 3) return "Средний работник";
  if (rating >= 2) return "Требует улучшения";
  return "Неудовлетворительно";
}

/**
 * Проверяет, может ли пользователь оставить отзыв
 */
export function canLeaveReview(
  reviewerId: number,
  targetId: number,
  existingReview?: Rating
): { allowed: boolean; reason?: string } {
  if (reviewerId === targetId) {
    return { allowed: false, reason: "Нельзя оставлять отзыв на себя" };
  }

  if (existingReview) {
    return { allowed: false, reason: "Вы уже оставили отзыв на этого пользователя" };
  }

  return { allowed: true };
}

/**
 * Генерирует текст благодарности за отзыв
 */
export function generateThankYouMessage(userName: string): string {
  return `Спасибо, ${userName}! Ваш отзыв помогает другим пользователям принять правильное решение.`;
}

/**
 * Вычисляет надежность пользователя на основе рейтингов
 */
export function calculateReliabilityScore(ratings: Rating[]): number {
  if (ratings.length === 0) return 0;

  const avgRating = calculateAverageRating(ratings);
  const completionRate = ratings.filter((r) => r.rating >= 3).length / ratings.length;

  // Формула: 70% от среднего рейтинга + 30% от процента положительных отзывов
  return Math.round(avgRating * 0.7 * 20 + completionRate * 0.3 * 100);
}

/**
 * Получает советы для улучшения рейтинга
 */
export function getImprovementTips(ratings: Rating[]): string[] {
  if (ratings.length === 0) {
    return ["Начните с выполнения первого заказа", "Получите первый положительный отзыв"];
  }

  const avgRating = calculateAverageRating(ratings);
  const tips: string[] = [];

  if (avgRating < 3) {
    tips.push("Улучшите качество выполнения работ");
    tips.push("Лучше общайтесь с клиентами");
    tips.push("Будьте более пунктуальны");
  } else if (avgRating < 4) {
    tips.push("Старайтесь быть еще внимательнее к деталям");
    tips.push("Улучшайте коммуникацию с клиентами");
  } else {
    tips.push("Продолжайте в том же духе!");
    tips.push("Поделитесь своим опытом с другими");
  }

  return tips;
}

/**
 * Форматирует дату отзыва для отображения
 */
export function formatReviewDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";
  if (diffDays < 7) return `${diffDays} дней назад`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "неделю" : "недель"} назад`;
  }

  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Проверяет, является ли отзыв полезным
 */
export function isHelpfulReview(rating: Rating): boolean {
  return (
    rating.comment.length >= 20 &&
    rating.categories.professionalism > 0 &&
    rating.categories.communication > 0
  );
}
