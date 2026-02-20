export interface ModerationReport {
  id: number;
  reporterId: number;
  targetUserId: number;
  targetType: 'user' | 'job' | 'review' | 'message';
  reason: string;
  description: string;
  evidence?: string[];
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface UserBan {
  id: number;
  userId: number;
  reason: string;
  banType: 'temporary' | 'permanent';
  duration?: number; // в днях
  bannedAt: Date;
  unbannedAt?: Date;
}

// Создание жалобы
export async function createModerationReport(report: Omit<ModerationReport, 'id' | 'createdAt' | 'status'>): Promise<ModerationReport> {
  return {
    ...report,
    id: Math.floor(Math.random() * 1000000),
    status: 'pending',
    createdAt: new Date(),
  };
}

// Проверка жалобы
export async function reviewModerationReport(reportId: number, decision: 'approve' | 'dismiss', notes?: string): Promise<boolean> {
  // Проверить жалобу
  // Если approve - заблокировать пользователя
  // Отправить уведомление
  return true;
}

// Блокировка пользователя
export async function banUser(userId: number, reason: string, banType: 'temporary' | 'permanent', duration?: number): Promise<UserBan> {
  return {
    id: Math.floor(Math.random() * 1000000),
    userId,
    reason,
    banType,
    duration,
    bannedAt: new Date(),
  };
}

// Разблокировка пользователя
export async function unbanUser(userId: number): Promise<boolean> {
  return true;
}

// Проверка, заблокирован ли пользователь
export async function isUserBanned(userId: number): Promise<boolean> {
  return false;
}

// Получение истории блокировок
export async function getUserBanHistory(userId: number): Promise<UserBan[]> {
  return [];
}

// Система апелляций
export interface Appeal {
  id: number;
  userId: number;
  banId: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  resolvedAt?: Date;
}

export async function createAppeal(userId: number, banId: number, reason: string): Promise<Appeal> {
  return {
    id: Math.floor(Math.random() * 1000000),
    userId,
    banId,
    reason,
    status: 'pending',
    createdAt: new Date(),
  };
}

export async function resolveAppeal(appealId: number, decision: 'approved' | 'rejected'): Promise<boolean> {
  // Если approved - разблокировать пользователя
  // Отправить уведомление
  return true;
}

// Контент-модерация
export interface ContentModerationResult {
  isApproved: boolean;
  violatedRules: string[];
  confidenceScore: number;
}

export async function moderateContent(content: string): Promise<ContentModerationResult> {
  // Проверить контент на спам, оскорбления, запрещенный контент
  return {
    isApproved: true,
    violatedRules: [],
    confidenceScore: 1.0,
  };
}
