/**
 * Review & Rating Service
 * Система рейтинга и отзывов
 */

import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================

export interface Review {
  id: string;
  taskId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  rating: number; // 1-5
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  verified: boolean; // Проверено ли, что это реальный заказчик/исполнитель
  helpful: number; // Количество людей, которые отметили отзыв как полезный
  moderated: boolean;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
  response?: ReviewResponse;
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  responderId: string;
  responderName: string;
  content: string;
  createdAt: Date;
}

export interface UserRating {
  userId: string;
  averageRating: number; // 1-5
  totalReviews: number;
  totalRating: number; // Сумма всех рейтингов
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  responseRate: number; // % ответов на отзывы
  lastUpdated: Date;
}

// ============================================================================
// REVIEW SERVICE
// ============================================================================

export class ReviewService {
  /**
   * Создать отзыв
   */
  static createReview(
    taskId: string,
    reviewerId: string,
    reviewerName: string,
    revieweeId: string,
    rating: number,
    title: string,
    content: string,
    pros?: string[],
    cons?: string[]
  ): Review {
    return {
      id: `review-${Date.now()}-${Math.random()}`,
      taskId,
      reviewerId,
      reviewerName,
      revieweeId,
      rating: Math.max(1, Math.min(5, rating)), // Ограничить 1-5
      title,
      content,
      pros,
      cons,
      verified: true,
      helpful: 0,
      moderated: false,
      approved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Добавить ответ на отзыв
   */
  static addResponse(
    reviewId: string,
    responderId: string,
    responderName: string,
    content: string
  ): ReviewResponse {
    return {
      id: `response-${Date.now()}-${Math.random()}`,
      reviewId,
      responderId,
      responderName,
      content,
      createdAt: new Date(),
    };
  }

  /**
   * Рассчитать средний рейтинг пользователя
   */
  static calculateUserRating(reviews: Review[]): UserRating {
    const approvedReviews = reviews.filter((r) => r.approved);

    if (approvedReviews.length === 0) {
      return {
        userId: "",
        averageRating: 0,
        totalReviews: 0,
        totalRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        responseRate: 0,
        lastUpdated: new Date(),
      };
    }

    const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / approvedReviews.length;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approvedReviews.forEach((r) => {
      ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
    });

    const reviewsWithResponse = approvedReviews.filter((r) => r.response).length;
    const responseRate = (reviewsWithResponse / approvedReviews.length) * 100;

    return {
      userId: "",
      averageRating: Math.round(averageRating * 100) / 100,
      totalReviews: approvedReviews.length,
      totalRating,
      ratingDistribution,
      responseRate: Math.round(responseRate),
      lastUpdated: new Date(),
    };
  }

  /**
   * Получить статистику рейтинга
   */
  static getRatingStats(reviews: Review[]): {
    average: number;
    total: number;
    distribution: Record<number, number>;
    percentages: Record<number, number>;
  } {
    const approvedReviews = reviews.filter((r) => r.approved);
    const total = approvedReviews.length;

    if (total === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    approvedReviews.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
      sum += r.rating;
    });

    const percentages: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) {
      percentages[i] = Math.round((distribution[i as keyof typeof distribution] / total) * 100);
    }

    return {
      average: Math.round((sum / total) * 100) / 100,
      total,
      distribution,
      percentages,
    };
  }

  /**
   * Проверить, может ли пользователь оставить отзыв
   */
  static canLeaveReview(
    taskId: string,
    reviewerId: string,
    revieweeId: string,
    existingReviews: Review[],
    taskCompleted: boolean
  ): { canReview: boolean; reason?: string } {
    // Проверить, что задача выполнена
    if (!taskCompleted) {
      return { canReview: false, reason: "Задача должна быть выполнена" };
    }

    // Проверить, что уже нет отзыва от этого пользователя
    const existingReview = existingReviews.find(
      (r) => r.taskId === taskId && r.reviewerId === reviewerId && r.revieweeId === revieweeId
    );

    if (existingReview) {
      return { canReview: false, reason: "Вы уже оставили отзыв на эту задачу" };
    }

    // Проверить, что не оставляет отзыв самому себе
    if (reviewerId === revieweeId) {
      return { canReview: false, reason: "Вы не можете оставить отзыв самому себе" };
    }

    return { canReview: true };
  }

  /**
   * Получить рекомендуемый рейтинг на основе других отзывов
   */
  static getSuggestedRating(reviews: Review[]): number {
    const approvedReviews = reviews.filter((r) => r.approved);
    if (approvedReviews.length === 0) return 5;

    const average = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
    return Math.round(average);
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const ReviewSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  reviewerId: z.string(),
  reviewerName: z.string(),
  revieweeId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  content: z.string().min(10).max(2000),
  pros: z.string().array().optional(),
  cons: z.string().array().optional(),
  verified: z.boolean(),
  helpful: z.number(),
  moderated: z.boolean(),
  approved: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateReviewSchema = z.object({
  taskId: z.string(),
  revieweeId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  content: z.string().min(10).max(2000),
  pros: z.string().array().optional(),
  cons: z.string().array().optional(),
});

export const ReviewResponseSchema = z.object({
  id: z.string(),
  reviewId: z.string(),
  responderId: z.string(),
  responderName: z.string(),
  content: z.string().min(1).max(1000),
  createdAt: z.date(),
});

export const AddResponseSchema = z.object({
  reviewId: z.string(),
  content: z.string().min(1).max(1000),
});

export const UserRatingSchema = z.object({
  userId: z.string(),
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number(),
  totalRating: z.number(),
  ratingDistribution: z.object({
    5: z.number(),
    4: z.number(),
    3: z.number(),
    2: z.number(),
    1: z.number(),
  }),
  responseRate: z.number(),
  lastUpdated: z.date(),
});
