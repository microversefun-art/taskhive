/**
 * Notification Service
 * Real-time уведомления через WebSocket + Database
 */

import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType =
  | "task_created"
  | "task_accepted"
  | "task_completed"
  | "task_cancelled"
  | "review_received"
  | "message_received"
  | "payment_received"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "rating_changed"
  | "new_follower"
  | "system_alert";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, string | number>;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskNotifications: boolean;
  messageNotifications: boolean;
  reviewNotifications: boolean;
  paymentNotifications: boolean;
  systemNotifications: boolean;
}

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export class NotificationService {
  private wsClients: Map<string, Set<any>> = new Map(); // userId -> Set of WebSocket connections

  /**
   * Подписать пользователя на WebSocket
   */
  subscribeToNotifications(userId: string, ws: any): void {
    if (!this.wsClients.has(userId)) {
      this.wsClients.set(userId, new Set());
    }
    this.wsClients.get(userId)!.add(ws);

    // Отправить приветственное сообщение
    ws.send(
      JSON.stringify({
        type: "subscribed",
        userId,
        timestamp: new Date().toISOString(),
      })
    );

    // Обработчик отключения
    ws.on("close", () => {
      const clients = this.wsClients.get(userId);
      if (clients) {
        clients.delete(ws);
        if (clients.size === 0) {
          this.wsClients.delete(userId);
        }
      }
    });
  }

  /**
   * Отправить уведомление пользователю в реальном времени
   */
  async sendNotification(notification: Notification): Promise<void> {
    const clients = this.wsClients.get(notification.userId);

    if (clients && clients.size > 0) {
      const message = JSON.stringify({
        type: "notification",
        notification,
        timestamp: new Date().toISOString(),
      });

      clients.forEach((ws) => {
        try {
          ws.send(message);
        } catch (error) {
          console.error("Failed to send notification via WebSocket:", error);
        }
      });
    }
  }

  /**
   * Отправить уведомление нескольким пользователям
   */
  async broadcastNotification(userIds: string[], notification: Omit<Notification, "userId">): Promise<void> {
    for (const userId of userIds) {
      await this.sendNotification({
        ...notification,
        userId,
      });
    }
  }

  /**
   * Получить активные соединения пользователя
   */
  getActiveConnections(userId: string): number {
    return this.wsClients.get(userId)?.size || 0;
  }

  /**
   * Получить всех активных пользователей
   */
  getActiveUsers(): string[] {
    return Array.from(this.wsClients.keys());
  }

  /**
   * Отключить пользователя
   */
  disconnectUser(userId: string): void {
    const clients = this.wsClients.get(userId);
    if (clients) {
      clients.forEach((ws) => {
        try {
          ws.close();
        } catch (error) {
          console.error("Failed to close WebSocket:", error);
        }
      });
      this.wsClients.delete(userId);
    }
  }
}

// ============================================================================
// NOTIFICATION BUILDER
// ============================================================================

export class NotificationBuilder {
  /**
   * Новая задача создана
   */
  static taskCreated(userId: string, taskId: string, taskTitle: string): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type: "task_created",
      title: "Новая задача",
      message: `Задача "${taskTitle}" создана`,
      data: { taskId },
      read: false,
      createdAt: new Date(),
      actionUrl: `/tasks/${taskId}`,
    };
  }

  /**
   * Задача принята
   */
  static taskAccepted(userId: string, taskId: string, executorName: string): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type: "task_accepted",
      title: "Задача принята",
      message: `${executorName} принял вашу задачу`,
      data: { taskId },
      read: false,
      createdAt: new Date(),
      actionUrl: `/tasks/${taskId}`,
    };
  }

  /**
   * Задача выполнена
   */
  static taskCompleted(userId: string, taskId: string, executorName: string): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type: "task_completed",
      title: "Задача выполнена",
      message: `${executorName} выполнил вашу задачу`,
      data: { taskId },
      read: false,
      createdAt: new Date(),
      actionUrl: `/tasks/${taskId}`,
    };
  }

  /**
   * Отзыв получен
   */
  static reviewReceived(userId: string, reviewerId: string, rating: number): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type: "review_received",
      title: "Новый отзыв",
      message: `Вы получили отзыв: ${rating} звёзд`,
      data: { reviewerId, rating },
      read: false,
      createdAt: new Date(),
      actionUrl: `/profile/${userId}/reviews`,
    };
  }

  /**
   * Сообщение получено
   */
  static messageReceived(userId: string, senderName: string, chatId: string): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type: "message_received",
      title: "Новое сообщение",
      message: `${senderName} отправил вам сообщение`,
      data: { chatId },
      read: false,
      createdAt: new Date(),
      actionUrl: `/chat/${chatId}`,
    };
  }

  /**
   * Платёж получен
   */
  static paymentReceived(userId: string, amount: number): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type: "payment_received",
      title: "Платёж получен",
      message: `Вы получили платёж: ${amount} ₽`,
      data: { amount },
      read: false,
      createdAt: new Date(),
      actionUrl: `/wallet`,
    };
  }

  /**
   * Вывод одобрен
   */
  static withdrawalApproved(userId: string, amount: number): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type: "withdrawal_approved",
      title: "Вывод одобрен",
      message: `Вывод ${amount} ₽ одобрен и будет отправлен в течение 1-2 дней`,
      data: { amount },
      read: false,
      createdAt: new Date(),
      actionUrl: `/wallet/history`,
    };
  }

  /**
   * Вывод отклонён
   */
  static withdrawalRejected(userId: string, amount: number, reason: string): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type: "withdrawal_rejected",
      title: "Вывод отклонён",
      message: `Вывод ${amount} ₽ отклонён: ${reason}`,
      data: { amount, reason },
      read: false,
      createdAt: new Date(),
      actionUrl: `/wallet`,
    };
  }

  /**
   * Рейтинг изменился
   */
  static ratingChanged(userId: string, newRating: number, change: number): Notification {
    const direction = change > 0 ? "повысился" : "понизился";
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type: "rating_changed",
      title: "Рейтинг изменился",
      message: `Ваш рейтинг ${direction} до ${newRating.toFixed(2)}`,
      data: { newRating, change },
      read: false,
      createdAt: new Date(),
      actionUrl: `/profile/${userId}`,
    };
  }

  /**
   * Системное оповещение
   */
  static systemAlert(userId: string, title: string, message: string): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type: "system_alert",
      title,
      message,
      read: false,
      createdAt: new Date(),
    };
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum([
    "task_created",
    "task_accepted",
    "task_completed",
    "task_cancelled",
    "review_received",
    "message_received",
    "payment_received",
    "withdrawal_approved",
    "withdrawal_rejected",
    "rating_changed",
    "new_follower",
    "system_alert",
  ] as const),
  title: z.string(),
  message: z.string(),
  data: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  read: z.boolean(),
  createdAt: z.date(),
  actionUrl: z.string().url().optional(),
});

export const NotificationPreferencesSchema = z.object({
  userId: z.string(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  taskNotifications: z.boolean(),
  messageNotifications: z.boolean(),
  reviewNotifications: z.boolean(),
  paymentNotifications: z.boolean(),
  systemNotifications: z.boolean(),
})
