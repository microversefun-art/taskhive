/**
 * Analytics & Monitoring for TaskHive
 * Отслеживание метрик, производительности и пользовательского поведения
 */

import { z } from "zod";

export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
}

export interface UserMetrics {
  userId: string;
  totalJobs: number;
  completedJobs: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  lastActiveAt: Date;
}

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  completedJobs: number;
  totalRevenue: number;
  averageJobValue: number;
  conversionRate: number;
  userRetention: number;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  databaseQueryTime: number;
  errorRate: number;
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
}

// ============================================================================
// ANALYTICS TRACKER
// ============================================================================

export class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 10000;

  /**
   * Отследить событие
   */
  trackEvent(
    eventName: string,
    sessionId: string,
    properties: Record<string, any>,
    userId?: string,
    userAgent?: string,
    ipAddress?: string
  ): void {
    const event: AnalyticsEvent = {
      eventName,
      userId,
      sessionId,
      timestamp: new Date(),
      properties,
      userAgent,
      ipAddress,
    };

    this.events.push(event);

    // Ограничить размер массива
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Отправить в аналитику
    this.sendToAnalytics(event);
  }

  /**
   * Отследить просмотр страницы
   */
  trackPageView(
    sessionId: string,
    pageName: string,
    userId?: string,
    userAgent?: string
  ): void {
    this.trackEvent(
      "page_view",
      sessionId,
      {
        page: pageName,
        timestamp: Date.now(),
      },
      userId,
      userAgent
    );
  }

  /**
   * Отследить клик
   */
  trackClick(
    sessionId: string,
    elementName: string,
    elementId?: string,
    userId?: string
  ): void {
    this.trackEvent(
      "click",
      sessionId,
      {
        element: elementName,
        elementId: elementId,
        timestamp: Date.now(),
      },
      userId
    );
  }

  /**
   * Отследить конверсию
   */
  trackConversion(
    sessionId: string,
    conversionType: string,
    value: number,
    userId?: string
  ): void {
    this.trackEvent(
      "conversion",
      sessionId,
      {
        type: conversionType,
        value: value,
        timestamp: Date.now(),
      },
      userId
    );
  }

  /**
   * Отследить ошибку
   */
  trackError(
    sessionId: string,
    errorMessage: string,
    errorStack?: string,
    userId?: string
  ): void {
    this.trackEvent(
      "error",
      sessionId,
      {
        message: errorMessage,
        stack: errorStack,
        timestamp: Date.now(),
      },
      userId
    );
  }

  /**
   * Получить события
   */
  getEvents(limit: number = 100): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Отправить в аналитику (заглушка)
   */
  private async sendToAnalytics(event: AnalyticsEvent): Promise<void> {
    try {
      // Отправить в внешний сервис аналитики
      // await fetch('https://analytics.taskhive.com/track', {
      //   method: 'POST',
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error("[Analytics] Send error:", error);
    }
  }
}

// ============================================================================
// USER METRICS CALCULATOR
// ============================================================================

export class UserMetricsCalculator {
  /**
   * Вычислить метрики пользователя
   */
  static calculateUserMetrics(
    userId: string,
    jobs: any[],
    reviews: any[],
    earnings: number
  ): UserMetrics {
    const completedJobs = jobs.filter((j) => j.status === "completed").length;
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      userId,
      totalJobs: jobs.length,
      completedJobs,
      totalEarnings: earnings,
      averageRating,
      totalReviews: reviews.length,
      lastActiveAt: new Date(),
    };
  }

  /**
   * Вычислить процент завершения
   */
  static getCompletionRate(metrics: UserMetrics): number {
    if (metrics.totalJobs === 0) return 0;
    return (metrics.completedJobs / metrics.totalJobs) * 100;
  }

  /**
   * Определить уровень пользователя
   */
  static getUserLevel(metrics: UserMetrics): string {
    if (metrics.completedJobs >= 100 && metrics.averageRating >= 4.8) {
      return "Pro";
    }
    if (metrics.completedJobs >= 50 && metrics.averageRating >= 4.5) {
      return "Expert";
    }
    if (metrics.completedJobs >= 10 && metrics.averageRating >= 4.0) {
      return "Verified";
    }
    if (metrics.completedJobs >= 1) {
      return "Active";
    }
    return "New";
  }
}

// ============================================================================
// PLATFORM METRICS CALCULATOR
// ============================================================================

export class PlatformMetricsCalculator {
  /**
   * Вычислить метрики платформы
   */
  static calculatePlatformMetrics(
    totalUsers: number,
    activeUsers: number,
    jobs: any[],
    revenue: number
  ): PlatformMetrics {
    const completedJobs = jobs.filter((j) => j.status === "completed").length;
    const averageJobValue = jobs.length > 0 ? revenue / jobs.length : 0;
    const conversionRate = jobs.length > 0 ? (completedJobs / jobs.length) * 100 : 0;
    const userRetention = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    return {
      totalUsers,
      activeUsers,
      totalJobs: jobs.length,
      completedJobs,
      totalRevenue: revenue,
      averageJobValue,
      conversionRate,
      userRetention,
    };
  }

  /**
   * Получить статистику по категориям
   */
  static getCategoryStats(jobs: any[]): Record<string, number> {
    const stats: Record<string, number> = {};

    jobs.forEach((job) => {
      const category = job.category || "other";
      stats[category] = (stats[category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Получить статистику по городам
   */
  static getCityStats(users: any[]): Record<string, number> {
    const stats: Record<string, number> = {};

    users.forEach((user) => {
      const city = user.city || "unknown";
      stats[city] = (stats[city] || 0) + 1;
    });

    return stats;
  }
}

// ============================================================================
// PERFORMANCE MONITOR
// ============================================================================

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  /**
   * Записать метрики производительности
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);

    // Ограничить размер массива
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Получить среднюю производительность
   */
  getAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        pageLoadTime: 0,
        apiResponseTime: 0,
        databaseQueryTime: 0,
        errorRate: 0,
        uptime: 100,
        cpuUsage: 0,
        memoryUsage: 0,
      };
    }

    const sum = this.metrics.reduce(
      (acc, m) => ({
        pageLoadTime: acc.pageLoadTime + m.pageLoadTime,
        apiResponseTime: acc.apiResponseTime + m.apiResponseTime,
        databaseQueryTime: acc.databaseQueryTime + m.databaseQueryTime,
        errorRate: acc.errorRate + m.errorRate,
        uptime: acc.uptime + m.uptime,
        cpuUsage: acc.cpuUsage + m.cpuUsage,
        memoryUsage: acc.memoryUsage + m.memoryUsage,
      }),
      {
        pageLoadTime: 0,
        apiResponseTime: 0,
        databaseQueryTime: 0,
        errorRate: 0,
        uptime: 0,
        cpuUsage: 0,
        memoryUsage: 0,
      }
    );

    const count = this.metrics.length;

    return {
      pageLoadTime: sum.pageLoadTime / count,
      apiResponseTime: sum.apiResponseTime / count,
      databaseQueryTime: sum.databaseQueryTime / count,
      errorRate: sum.errorRate / count,
      uptime: sum.uptime / count,
      cpuUsage: sum.cpuUsage / count,
      memoryUsage: sum.memoryUsage / count,
    };
  }

  /**
   * Получить метрики за период
   */
  getMetricsByPeriod(startDate: Date, endDate: Date): PerformanceMetrics[] {
    return this.metrics.filter(
      (m) => m.uptime >= 0 // Placeholder filter
    );
  }

  /**
   * Проверить здоровье системы
   */
  getSystemHealth(): {
    status: "healthy" | "warning" | "critical";
    issues: string[];
  } {
    const avg = this.getAverageMetrics();
    const issues: string[] = [];

    if (avg.errorRate > 5) {
      issues.push("High error rate");
    }
    if (avg.pageLoadTime > 3000) {
      issues.push("Slow page load time");
    }
    if (avg.apiResponseTime > 1000) {
      issues.push("Slow API response");
    }
    if (avg.uptime < 99) {
      issues.push("Low uptime");
    }
    if (avg.cpuUsage > 80) {
      issues.push("High CPU usage");
    }
    if (avg.memoryUsage > 80) {
      issues.push("High memory usage");
    }

    let status: "healthy" | "warning" | "critical" = "healthy";
    if (issues.length > 2) {
      status = "critical";
    } else if (issues.length > 0) {
      status = "warning";
    }

    return { status, issues };
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const AnalyticsEventSchema = z.object({
  eventName: z.string().min(1),
  userId: z.string().optional(),
  sessionId: z.string().min(1),
  timestamp: z.date(),
  properties: z.record(z.string(), z.any()),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export const PerformanceMetricsSchema = z.object({
  pageLoadTime: z.number().nonnegative(),
  apiResponseTime: z.number().nonnegative(),
  databaseQueryTime: z.number().nonnegative(),
  errorRate: z.number().min(0).max(100),
  uptime: z.number().min(0).max(100),
  cpuUsage: z.number().min(0).max(100),
  memoryUsage: z.number().min(0).max(100),
});
