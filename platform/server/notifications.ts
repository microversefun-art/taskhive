import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { sendEmailMessage } from "./messenger";
import { sendTelegramMessage } from "./messenger";

/**
 * Notification System Module
 * Система уведомлений для пользователей
 */

export interface Notification {
  id: number;
  userId: number;
  type: "application" | "message" | "payment" | "rating" | "system";
  title: string;
  content?: string;
  isRead: boolean;
  relatedId?: number;
  createdAt: Date;
}

// In-memory storage for notifications (в production используйте БД)
const notificationsStore: Map<number, Notification[]> = new Map();

export async function createNotification(
  userId: number,
  notification: Omit<Notification, "id" | "createdAt" | "isRead">
): Promise<Notification> {
  const id = Math.floor(Math.random() * 1000000);
  const newNotification: Notification = {
    ...notification,
    id,
    isRead: false,
    createdAt: new Date(),
  };

  if (!notificationsStore.has(userId)) {
    notificationsStore.set(userId, []);
  }

  notificationsStore.get(userId)!.push(newNotification);

  // Отправить уведомление через различные каналы
  await sendNotificationToChannels(userId, newNotification);

  return newNotification;
}

export async function getNotifications(userId: number, limit: number = 20): Promise<Notification[]> {
  const notifications = notificationsStore.get(userId) || [];
  return notifications.slice(-limit).reverse();
}

export async function markAsRead(notificationId: number, userId: number): Promise<boolean> {
  const notifications = notificationsStore.get(userId);
  if (!notifications) return false;

  const notification = notifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
    return true;
  }

  return false;
}

export async function deleteNotification(notificationId: number, userId: number): Promise<boolean> {
  const notifications = notificationsStore.get(userId);
  if (!notifications) return false;

  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index !== -1) {
    notifications.splice(index, 1);
    return true;
  }

  return false;
}

// Отправить уведомление через все доступные каналы
async function sendNotificationToChannels(userId: number, notification: Notification) {
  // Отправить email
  try {
    await sendEmailMessage(
      "user@example.com",
      notification.title,
      `<h2>${notification.title}</h2><p>${notification.content || ""}</p>`
    );
  } catch (error) {
    console.error("[Notifications] Failed to send email:", error);
  }

  // Отправить Telegram (если настроено)
  try {
    const message = `📬 ${notification.title}\n\n${notification.content || ""}`;
    await sendTelegramMessage(String(userId), message);
  } catch (error) {
    console.error("[Notifications] Failed to send Telegram:", error);
  }
}

// Шаблоны уведомлений
export const notificationTemplates = {
  applicationReceived: (workerName: string, jobTitle: string) => ({
    type: "application" as const,
    title: `Новый отклик от ${workerName}`,
    content: `${workerName} откликнулся на вакансию "${jobTitle}"`,
  }),

  applicationAccepted: (jobTitle: string) => ({
    type: "application" as const,
    title: "Ваш отклик принят!",
    content: `Работодатель принял ваш отклик на вакансию "${jobTitle}"`,
  }),

  applicationRejected: (jobTitle: string) => ({
    type: "application" as const,
    title: "Отклик отклонен",
    content: `К сожалению, ваш отклик на вакансию "${jobTitle}" был отклонен`,
  }),

  newMessage: (senderName: string) => ({
    type: "message" as const,
    title: `Новое сообщение от ${senderName}`,
    content: `${senderName} отправил вам сообщение`,
  }),

  paymentReceived: (amount: number) => ({
    type: "payment" as const,
    title: "Платеж получен",
    content: `Вы получили платеж в размере ${amount} ₽`,
  }),

  paymentSent: (amount: number, recipientName: string) => ({
    type: "payment" as const,
    title: "Платеж отправлен",
    content: `Вы отправили ${amount} ₽ пользователю ${recipientName}`,
  }),

  ratingReceived: (rating: number, reviewer: string) => ({
    type: "rating" as const,
    title: `Новая оценка от ${reviewer}`,
    content: `${reviewer} оценил вас на ${rating} звезд`,
  }),

  jobPosted: (jobTitle: string) => ({
    type: "system" as const,
    title: "Вакансия опубликована",
    content: `Ваша вакансия "${jobTitle}" успешно опубликована`,
  }),

  jobExpiringSoon: (jobTitle: string, daysLeft: number) => ({
    type: "system" as const,
    title: "Вакансия скоро истечет",
    content: `Вакансия "${jobTitle}" истечет через ${daysLeft} дней`,
  }),

  systemMaintenance: () => ({
    type: "system" as const,
    title: "Техническое обслуживание",
    content: "Платформа будет недоступна для обслуживания",
  }),
};

// tRPC Router for Notification Operations
export const notificationRouter = router({
  // Получить все уведомления пользователя
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      return await getNotifications(ctx.user.id, input.limit);
    }),

  // Получить непрочитанные уведомления
  unread: protectedProcedure.query(async ({ ctx }) => {
    const notifications = await getNotifications(ctx.user.id, 100);
    return notifications.filter((n) => !n.isRead);
  }),

  // Отметить уведомление как прочитанное
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await markAsRead(input.notificationId, ctx.user.id);
    }),

  // Отметить все как прочитанные
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const notifications = notificationsStore.get(ctx.user.id) || [];
    notifications.forEach((n) => {
      n.isRead = true;
    });
    return true;
  }),

  // Удалить уведомление
  delete: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await deleteNotification(input.notificationId, ctx.user.id);
    }),

  // Удалить все уведомления
  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    notificationsStore.delete(ctx.user.id);
    return true;
  }),

  // Получить статистику уведомлений
  stats: protectedProcedure.query(async ({ ctx }) => {
    const notifications = await getNotifications(ctx.user.id, 1000);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const byType = notifications.reduce(
      (acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: notifications.length,
      unread: unreadCount,
      byType,
    };
  }),

  // Получить уведомления по типу
  byType: protectedProcedure
    .input(
      z.object({
        type: z.enum(["application", "message", "payment", "rating", "system"]),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const notifications = await getNotifications(ctx.user.id, 100);
      return notifications.filter((n) => n.type === input.type).slice(-input.limit);
    }),

  // Получить настройки уведомлений
  settings: protectedProcedure.query(async () => {
    return {
      email: true,
      telegram: true,
      vk: false,
      whatsapp: false,
      inApp: true,
      applicationNotifications: true,
      messageNotifications: true,
      paymentNotifications: true,
      ratingNotifications: true,
      systemNotifications: true,
    };
  }),

  // Обновить настройки уведомлений
  updateSettings: protectedProcedure
    .input(
      z.object({
        email: z.boolean().optional(),
        telegram: z.boolean().optional(),
        vk: z.boolean().optional(),
        whatsapp: z.boolean().optional(),
        inApp: z.boolean().optional(),
        applicationNotifications: z.boolean().optional(),
        messageNotifications: z.boolean().optional(),
        paymentNotifications: z.boolean().optional(),
        ratingNotifications: z.boolean().optional(),
        systemNotifications: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // В production сохраняйте в БД
      return {
        success: true,
        settings: input,
      };
    }),
});
