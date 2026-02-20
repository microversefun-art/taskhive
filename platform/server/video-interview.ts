import { z } from "zod";

/**
 * Модуль для управления видеоинтервью
 * Использует WebRTC для прямого видеообщения между работниками и работодателями
 */

export const videoInterviewSchema = z.object({
  id: z.number().optional(),
  jobId: z.number(),
  workerId: z.number(),
  employerId: z.number(),
  scheduledAt: z.date().optional(),
  duration: z.number().optional(), // в минутах
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
  recordingUrl: z.string().optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type VideoInterview = z.infer<typeof videoInterviewSchema>;

/**
 * Генерирует уникальный код комнаты для видеоинтервью
 */
export function generateRoomCode(jobId: number, workerId: number): string {
  return `interview-${jobId}-${workerId}-${Date.now()}`;
}

/**
 * Валидирует параметры видеоинтервью
 */
export function validateInterviewSetup(
  jobId: number,
  workerId: number,
  employerId: number
): { valid: boolean; error?: string } {
  if (!jobId || jobId <= 0) {
    return { valid: false, error: "Некорректный ID вакансии" };
  }
  if (!workerId || workerId <= 0) {
    return { valid: false, error: "Некорректный ID работника" };
  }
  if (!employerId || employerId <= 0) {
    return { valid: false, error: "Некорректный ID работодателя" };
  }
  return { valid: true };
}

/**
 * Получает конфигурацию WebRTC серверов
 */
export function getWebRTCConfig() {
  return {
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302"] },
      { urls: ["stun:stun1.l.google.com:19302"] },
      { urls: ["stun:stun2.l.google.com:19302"] },
    ],
  };
}

/**
 * Генерирует ссылку для присоединения к интервью
 */
export function generateInterviewLink(roomCode: string, baseUrl: string): string {
  return `${baseUrl}/interview/${roomCode}`;
}

/**
 * Проверяет доступ к видеоинтервью
 */
export function checkInterviewAccess(
  userId: number,
  interview: VideoInterview,
  userRole: "worker" | "employer"
): boolean {
  if (userRole === "worker") {
    return interview.workerId === userId;
  } else if (userRole === "employer") {
    return interview.employerId === userId;
  }
  return false;
}

/**
 * Форматирует статус интервью для отображения
 */
export function formatInterviewStatus(
  status: VideoInterview["status"]
): string {
  const statusMap: Record<VideoInterview["status"], string> = {
    scheduled: "Запланировано",
    in_progress: "В процессе",
    completed: "Завершено",
    cancelled: "Отменено",
  };
  return statusMap[status] || status;
}

/**
 * Вычисляет оставшееся время до интервью
 */
export function getTimeUntilInterview(scheduledAt: Date): {
  minutes: number;
  seconds: number;
  isStarted: boolean;
} {
  const now = new Date();
  const diff = scheduledAt.getTime() - now.getTime();

  if (diff <= 0) {
    return { minutes: 0, seconds: 0, isStarted: true };
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return { minutes, seconds, isStarted: false };
}

/**
 * Получает рекомендации для видеоинтервью
 */
export function getInterviewTips(): string[] {
  return [
    "Проверьте интернет-соединение перед началом",
    "Убедитесь, что камера и микрофон работают",
    "Выберите спокойное место без фонового шума",
    "Проверьте освещение - оно должно быть достаточным",
    "Подготовьте документы, если требуется",
    "Присоединитесь за 5 минут до начала",
  ];
}

/**
 * Генерирует уведомление перед интервью
 */
export function generateInterviewReminder(
  userName: string,
  jobTitle: string,
  scheduledAt: Date
): { title: string; message: string } {
  const timeStr = scheduledAt.toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    title: `Видеоинтервью с ${userName}`,
    message: `Интервью на должность "${jobTitle}" запланировано на ${timeStr}. Пожалуйста, присоединитесь за 5 минут до начала.`,
  };
}
