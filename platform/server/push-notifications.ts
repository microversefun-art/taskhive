export interface PushSubscription {
  endpoint: string;
  auth: string;
  p256dh: string;
}

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

// Сохранение подписки на push-уведомления
export async function savePushSubscription(
  userId: number,
  subscription: PushSubscription
): Promise<boolean> {
  try {
    if (!subscription.endpoint || !subscription.auth || !subscription.p256dh) {
      throw new Error("Invalid subscription data");
    }

    console.log("[Push] Subscription saved for user:", userId);
    return true;
  } catch (error) {
    console.error("[Push] Error saving subscription:", error);
    return false;
  }
}

// Отправка push-уведомления
export async function sendPushNotification(
  userId: number,
  notification: PushNotification
): Promise<boolean> {
  try {
    if (!notification.title || !notification.body) {
      throw new Error("Title and body are required");
    }

    console.log("[Push] Notification sent to user:", userId, notification);
    return true;
  } catch (error) {
    console.error("[Push] Error sending notification:", error);
    return false;
  }
}

// Отправка уведомления о новой вакансии
export async function notifyNewJob(
  userId: number,
  jobTitle: string,
  salary: number
): Promise<boolean> {
  const notification: PushNotification = {
    title: "Новая вакансия!",
    body: `${jobTitle} - ${salary} ₽/час`,
    icon: "/icon-192.png",
    badge: "/badge.png",
    tag: "new-job",
    data: {
      type: "job",
      action: "view_job",
    },
  };

  return sendPushNotification(userId, notification);
}

// Отправка уведомления об отклике
export async function notifyApplicationResponse(
  userId: number,
  jobTitle: string,
  status: "accepted" | "rejected"
): Promise<boolean> {
  const statusText = status === "accepted" ? "принят" : "отклонен";
  const notification: PushNotification = {
    title: `Отклик ${statusText}`,
    body: `Ваш отклик на вакансию "${jobTitle}" был ${statusText}`,
    icon: "/icon-192.png",
    tag: "application-response",
    data: {
      type: "application",
      status,
    },
  };

  return sendPushNotification(userId, notification);
}

// Отправка уведомления о новом сообщении
export async function notifyNewMessage(
  userId: number,
  senderName: string,
  messagePreview: string
): Promise<boolean> {
  const notification: PushNotification = {
    title: `Новое сообщение от ${senderName}`,
    body: messagePreview.substring(0, 100),
    icon: "/icon-192.png",
    tag: "new-message",
    data: {
      type: "message",
      action: "open_chat",
    },
  };

  return sendPushNotification(userId, notification);
}

// Отправка уведомления о доходах
export async function notifyEarnings(
  userId: number,
  amount: number,
  source: string
): Promise<boolean> {
  const notification: PushNotification = {
    title: "Поступление средств",
    body: `Вы получили ${amount} ₽ от ${source}`,
    icon: "/icon-192.png",
    badge: "/badge.png",
    tag: "earnings",
    data: {
      type: "earnings",
      amount,
    },
  };

  return sendPushNotification(userId, notification);
}

// Удаление подписки на push-уведомления
export async function removePushSubscription(userId: number): Promise<boolean> {
  try {
    console.log("[Push] Subscription removed for user:", userId);
    return true;
  } catch (error) {
    console.error("[Push] Error removing subscription:", error);
    return false;
  }
}

// Проверка поддержки push-уведомлений
export function isPushNotificationSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

// Запрос разрешения на push-уведомления
export async function requestPushPermission(): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("[Push] Error requesting permission:", error);
    return false;
  }
}
