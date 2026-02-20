/**
 * Модуль для аналитики и статистики платформы
 */

export interface UserAnalytics {
  userId: number;
  totalViews: number;
  totalClicks: number;
  totalApplications: number;
  conversionRate: number;
  averageSessionDuration: number;
  lastActive: Date;
}

export interface JobAnalytics {
  jobId: number;
  views: number;
  clicks: number;
  applications: number;
  conversionRate: number;
  averageTimeOnPage: number;
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  totalApplications: number;
  averageRating: number;
  totalRevenue: number;
  conversionRate: number;
}

/**
 * Отслеживает просмотр страницы вакансии
 */
export function trackJobView(jobId: number, userId?: number): {
  eventId: string;
  timestamp: Date;
  jobId: number;
  userId?: number;
} {
  return {
    eventId: `view-${jobId}-${Date.now()}`,
    timestamp: new Date(),
    jobId,
    userId,
  };
}

/**
 * Отслеживает клик на вакансию
 */
export function trackJobClick(jobId: number, userId?: number): {
  eventId: string;
  timestamp: Date;
  jobId: number;
  userId?: number;
} {
  return {
    eventId: `click-${jobId}-${Date.now()}`,
    timestamp: new Date(),
    jobId,
    userId,
  };
}

/**
 * Вычисляет коэффициент конверсии
 */
export function calculateConversionRate(
  totalViews: number,
  totalApplications: number
): number {
  if (totalViews === 0) return 0;
  return Math.round((totalApplications / totalViews) * 100 * 100) / 100;
}

/**
 * Генерирует отчет по популярным вакансиям
 */
export function generatePopularJobsReport(
  jobs: Array<{ jobId: number; views: number; applications: number }>
): Array<{ jobId: number; views: number; applications: number; score: number }> {
  return jobs
    .map((job) => ({
      ...job,
      score: job.views * 0.3 + job.applications * 0.7,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

/**
 * Генерирует отчет по категориям
 */
export function generateCategoryReport(
  categories: Array<{ name: string; jobs: number; applications: number }>
): Array<{
  name: string;
  jobs: number;
  applications: number;
  avgApplicationsPerJob: number;
}> {
  return categories.map((cat) => ({
    ...cat,
    avgApplicationsPerJob: cat.jobs > 0 ? cat.applications / cat.jobs : 0,
  }));
}

/**
 * Вычисляет статистику по времени суток
 */
export function getHourlyStats(
  events: Array<{ timestamp: Date }>
): Record<number, number> {
  const stats: Record<number, number> = {};

  for (let i = 0; i < 24; i++) {
    stats[i] = 0;
  }

  events.forEach((event) => {
    const hour = event.timestamp.getHours();
    stats[hour]++;
  });

  return stats;
}

/**
 * Вычисляет статистику по дням недели
 */
export function getDailyStats(
  events: Array<{ timestamp: Date }>
): Record<string, number> {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const stats: Record<string, number> = {};

  days.forEach((day) => {
    stats[day] = 0;
  });

  events.forEach((event) => {
    const dayIndex = event.timestamp.getDay();
    const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1];
    stats[dayName]++;
  });

  return stats;
}

/**
 * Генерирует отчет по источникам трафика
 */
export function generateTrafficSourceReport(
  sources: Array<{ source: string; visits: number }>
): Array<{ source: string; visits: number; percentage: number }> {
  const total = sources.reduce((sum, s) => sum + s.visits, 0);

  return sources.map((source) => ({
    ...source,
    percentage: Math.round((source.visits / total) * 100 * 100) / 100,
  }));
}

/**
 * Вычисляет среднее время сеанса
 */
export function calculateAverageSessionDuration(
  sessions: Array<{ startTime: Date; endTime: Date }>
): number {
  if (sessions.length === 0) return 0;

  const totalDuration = sessions.reduce((sum, session) => {
    return sum + (session.endTime.getTime() - session.startTime.getTime());
  }, 0);

  return Math.round(totalDuration / sessions.length / 1000); // в секундах
}

/**
 * Генерирует отчет по демографии пользователей
 */
export function generateDemographicsReport(
  users: Array<{ age?: number; location?: string; userType: "worker" | "employer" }>
): {
  totalUsers: number;
  workers: number;
  employers: number;
  averageAge?: number;
  topLocations: Array<{ location: string; count: number }>;
} {
  const workers = users.filter((u) => u.userType === "worker").length;
  const employers = users.filter((u) => u.userType === "employer").length;
  const ages = users.filter((u) => u.age).map((u) => u.age!);
  const averageAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b) / ages.length) : undefined;

  const locationMap: Record<string, number> = {};
  users.forEach((u) => {
    if (u.location) {
      locationMap[u.location] = (locationMap[u.location] || 0) + 1;
    }
  });

  const topLocations = Object.entries(locationMap)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalUsers: users.length,
    workers,
    employers,
    averageAge,
    topLocations,
  };
}

/**
 * Генерирует отчет по доходам
 */
export function generateRevenueReport(
  transactions: Array<{ amount: number; date: Date; type: "commission" | "refund" }>
): {
  totalRevenue: number;
  commissions: number;
  refunds: number;
  averageTransaction: number;
  monthlyRevenue: Record<string, number>;
} {
  const commissions = transactions
    .filter((t) => t.type === "commission")
    .reduce((sum, t) => sum + t.amount, 0);
  const refunds = transactions
    .filter((t) => t.type === "refund")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRevenue = commissions - refunds;
  const averageTransaction = transactions.length > 0 ? totalRevenue / transactions.length : 0;

  const monthlyRevenue: Record<string, number> = {};
  transactions.forEach((t) => {
    const month = t.date.toISOString().substring(0, 7); // YYYY-MM
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (t.type === "commission" ? t.amount : -t.amount);
  });

  return {
    totalRevenue,
    commissions,
    refunds,
    averageTransaction: Math.round(averageTransaction * 100) / 100,
    monthlyRevenue,
  };
}

/**
 * Генерирует общий отчет платформы
 */
export function generatePlatformReport(
  users: number,
  activeUsers: number,
  jobs: number,
  applications: number,
  avgRating: number,
  revenue: number
): PlatformAnalytics {
  return {
    totalUsers: users,
    activeUsers,
    totalJobs: jobs,
    totalApplications: applications,
    averageRating: Math.round(avgRating * 10) / 10,
    totalRevenue: revenue,
    conversionRate: calculateConversionRate(jobs, applications),
  };
}
