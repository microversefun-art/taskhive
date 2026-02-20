/**
 * Telegram Bot Integration for TaskHive
 * Поддержка команд, линковки аккаунта, уведомлений
 */

import { z } from "zod";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: {
    id: number;
    first_name: string;
    username?: string;
    type: "private" | "group" | "supergroup" | "channel";
  };
  date: number;
  text?: string;
  entities?: Array<{
    type: string;
    offset: number;
    length: number;
  }>;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: TelegramUser;
    chat_instance: string;
    data?: string;
    message?: TelegramMessage;
  };
}

export interface TelegramNotification {
  userId: string;
  telegramId: number;
  type: "new_job" | "accepted" | "message" | "reminder";
  title: string;
  text: string;
  jobId?: string;
  actionUrl?: string;
}

// ============================================================================
// TELEGRAM BOT
// ============================================================================

export class TelegramBot {
  private botToken: string;
  private apiUrl = "https://api.telegram.org";
  private webhookUrl: string;
  private db: any; // Database connection
  private rateLimiter: Map<number, number[]> = new Map(); // Chat ID -> timestamps
  private maxMessagesPerMinute = 30;

  constructor(botToken: string, webhookUrl: string, db: any) {
    this.botToken = botToken;
    this.webhookUrl = webhookUrl;
    this.db = db;
  }

  /**
   * Установить webhook для получения обновлений
   */
  async setWebhook(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/bot${this.botToken}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: this.webhookUrl }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set webhook: ${response.statusText}`);
      }

      const data = await response.json() as any;
      console.log("[Telegram] Webhook set:", data.ok);
      return data.ok;
    } catch (error) {
      console.error("[Telegram] Webhook error:", error);
      return false;
    }
  }

  /**
   * Обработать входящее обновление
   */
  async handleUpdate(update: TelegramUpdate): Promise<void> {
    try {
      // Проверка rate limit
      if (!this.checkRateLimit(update.message?.chat.id || 0)) {
        console.warn("[Telegram] Rate limit exceeded");
        return;
      }

      if (update.message) {
        await this.handleMessage(update.message);
      } else if (update.callback_query) {
        await this.handleCallback(update.callback_query);
      }
    } catch (error) {
      console.error("[Telegram] Update error:", error);
    }
  }

  /**
   * Обработать текстовое сообщение
   */
  private async handleMessage(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id;
    const text = message.text || "";
    const userId = message.from.id;

    // Парсим команду
    const [command, ...args] = text.split(" ");

    switch (command) {
      case "/start":
        await this.handleStart(chatId, userId, message.from);
        break;
      case "/jobs":
        await this.handleJobs(chatId, args.join(" "));
        break;
      case "/city":
        await this.handleCity(chatId, args.join(" "));
        break;
      case "/category":
        await this.handleCategory(chatId, args.join(" "));
        break;
      case "/myjobs":
        await this.handleMyJobs(chatId, userId);
        break;
      case "/profile":
        await this.handleProfile(chatId, userId);
        break;
      case "/notifications":
        await this.handleNotifications(chatId, userId);
        break;
      case "/help":
        await this.handleHelp(chatId);
        break;
      default:
        await this.sendMessage(chatId, "Неизвестная команда. Введите /help для справки.");
    }
  }

  /**
   * Обработать callback query (кнопки)
   */
  private async handleCallback(callback: any): Promise<void> {
    const chatId = callback.message?.chat.id;
    const data = callback.data;

    if (data?.startsWith("job_")) {
      const jobId = data.replace("job_", "");
      await this.sendJobDetails(chatId, jobId);
    } else if (data?.startsWith("apply_")) {
      const jobId = data.replace("apply_", "");
      await this.applyForJob(chatId, callback.from.id, jobId);
    }

    // Ответить на callback query
    await this.answerCallbackQuery(callback.id, "✅ Выполнено!");
  }

  /**
   * /start - Начало работы
   */
  private async handleStart(chatId: number, userId: number, user: TelegramUser): Promise<void> {
    const text = `
👋 Добро пожаловать в TaskHive!

Я помогу тебе найти работу и заработать деньги.

Основные команды:
/jobs - Поиск вакансий
/city - Выбрать город
/category - Выбрать категорию
/myjobs - Мои задачи
/profile - Мой профиль
/notifications - Настройки уведомлений
/help - Справка

Хочешь связать аккаунт? Напиши /link
    `;

    await this.sendMessage(chatId, text);

    // Сохранить Telegram ID в БД
    try {
      await this.db.saveTelegramUser({
        telegramId: userId,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
      });
    } catch (error) {
      console.error("[Telegram] Error saving user:", error);
    }
  }

  /**
   * /jobs - Поиск вакансий
   */
  private async handleJobs(chatId: number, query: string): Promise<void> {
    try {
      // Получить вакансии из БД
      const jobs = await this.db.getJobs({ limit: 5, search: query });

      if (jobs.length === 0) {
        await this.sendMessage(chatId, "Вакансии не найдены 😔");
        return;
      }

      let text = "📋 Доступные вакансии:\n\n";

      for (const job of jobs as any[]) {
        text += `💼 ${job.title}\n`;
        text += `💰 ${job.salary} ₽\n`;
        text += `📍 ${job.city}\n`;
        text += `⏰ ${job.duration}\n\n`;
      }

      const keyboard = {
        inline_keyboard: jobs.map((job: any) => [
          {
            text: `${job.title} (${job.salary}₽)`,
            callback_data: `job_${job.id}`,
          },
        ]),
      };

      await this.sendMessage(chatId, text, keyboard);
    } catch (error) {
      console.error("[Telegram] Jobs error:", error);
      await this.sendMessage(chatId, "Ошибка при поиске вакансий");
    }
  }

  /**
   * /city - Выбрать город
   */
  private async handleCity(chatId: number, cityName: string): Promise<void> {
    try {
      if (!cityName) {
        const cities = await this.db.getCities({ limit: 10 });
        const keyboard = {
          inline_keyboard: cities.map((city: any) => [
            {
              text: city.name,
              callback_data: `city_${city.id}`,
            },
          ]),
        };
        await this.sendMessage(chatId, "Выбери город:", keyboard);
        return;
      }

      // Сохранить выбранный город
      await this.db.saveTelegramPreference(chatId, { city: cityName });
      await this.sendMessage(chatId, `✅ Город изменён на ${cityName}`);
    } catch (error) {
      console.error("[Telegram] City error:", error);
      await this.sendMessage(chatId, "Ошибка при выборе города");
    }
  }

  /**
   * /category - Выбрать категорию
   */
  private async handleCategory(chatId: number, categoryName: string): Promise<void> {
    try {
      if (!categoryName) {
        const categories = await this.db.getCategories();
        const keyboard = {
          inline_keyboard: categories.map((cat: any) => [
            {
              text: cat.name,
              callback_data: `cat_${cat.id}`,
            },
          ]),
        };
        await this.sendMessage(chatId, "Выбери категорию:", keyboard);
        return;
      }

      await this.db.saveTelegramPreference(chatId, { category: categoryName });
      await this.sendMessage(chatId, `✅ Категория изменена на ${categoryName}`);
    } catch (error) {
      console.error("[Telegram] Category error:", error);
      await this.sendMessage(chatId, "Ошибка при выборе категории");
    }
  }

  /**
   * /myjobs - Мои задачи
   */
  private async handleMyJobs(chatId: number, userId: number): Promise<void> {
    try {
      const jobs = await this.db.getUserJobs(userId, { limit: 5 });

      if (jobs.length === 0) {
        await this.sendMessage(chatId, "У тебя нет активных задач 📭");
        return;
      }

      let text = "📝 Твои задачи:\n\n";

      for (const job of jobs as any[]) {
        text += `✅ ${job.title}\n`;
        text += `💰 ${job.salary} ₽\n`;
        text += `⏳ Статус: ${job.status}\n\n`;
      }

      await this.sendMessage(chatId, text);
    } catch (error) {
      console.error("[Telegram] MyJobs error:", error);
      await this.sendMessage(chatId, "Ошибка при загрузке задач");
    }
  }

  /**
   * /profile - Мой профиль
   */
  private async handleProfile(chatId: number, userId: number): Promise<void> {
    try {
      const user = await this.db.getUser(userId);

      if (!user) {
        await this.sendMessage(
          chatId,
          "Профиль не найден. Свяжи аккаунт: https://taskhive.com/link"
        );
        return;
      }

      const text = `
👤 Мой профиль

Имя: ${user.name}
⭐ Рейтинг: ${user.rating}/5 (${user.reviewCount} отзывов)
💰 Заработано: ${user.earnings} ₽
✅ Выполнено задач: ${user.completedJobs}
📊 Уровень: ${user.level}

Ссылка на профиль: https://taskhive.com/profile/${user.id}
      `;

      await this.sendMessage(chatId, text);
    } catch (error) {
      console.error("[Telegram] Profile error:", error);
      await this.sendMessage(chatId, "Ошибка при загрузке профиля");
    }
  }

  /**
   * /notifications - Настройки уведомлений
   */
  private async handleNotifications(chatId: number, userId: number): Promise<void> {
    const keyboard = {
      inline_keyboard: [
        [
          { text: "🔔 Новые вакансии", callback_data: "notif_jobs" },
          { text: "✅ Принятие", callback_data: "notif_accepted" },
        ],
        [
          { text: "💬 Сообщения", callback_data: "notif_messages" },
          { text: "⏰ Напоминания", callback_data: "notif_reminders" },
        ],
        [{ text: "🔕 Отписаться от всех", callback_data: "notif_unsubscribe" }],
      ],
    };

    await this.sendMessage(chatId, "⚙️ Выбери, какие уведомления получать:", keyboard);
  }

  /**
   * /help - Справка
   */
  private async handleHelp(chatId: number): Promise<void> {
    const text = `
📖 Справка по командам

/start - Начало работы
/jobs [поиск] - Найти вакансии
/city [город] - Выбрать город
/category [категория] - Выбрать категорию
/myjobs - Мои текущие задачи
/profile - Мой профиль
/notifications - Настройки уведомлений
/help - Эта справка

💡 Примеры:
/jobs программирование
/city Москва
/category Доставка

🔗 Веб-сайт: https://taskhive.com
📧 Поддержка: support@taskhive.ru
    `;

    await this.sendMessage(chatId, text);
  }

  /**
   * Отправить детали вакансии
   */
  private async sendJobDetails(chatId: number, jobId: string): Promise<void> {
    try {
      const job = await this.db.getJob(jobId);

      if (!job) {
        await this.sendMessage(chatId, "Вакансия не найдена");
        return;
      }

      const text = `
💼 ${job.title}

💰 Зарплата: ${job.salary} ₽
📍 Город: ${job.city}
⏰ Длительность: ${job.duration}
📝 Описание: ${job.description}

Требования:
${job.requirements}

Условия:
${job.conditions}
      `;

      const keyboard = {
        inline_keyboard: [
          [{ text: "✅ Откликнуться", callback_data: `apply_${jobId}` }],
          [{ text: "❌ Отмена", callback_data: "cancel" }],
        ],
      };

      await this.sendMessage(chatId, text, keyboard);
    } catch (error) {
      console.error("[Telegram] Job details error:", error);
      await this.sendMessage(chatId, "Ошибка при загрузке деталей вакансии");
    }
  }

  /**
   * Откликнуться на вакансию
   */
  private async applyForJob(chatId: number, userId: number, jobId: string): Promise<void> {
    try {
      const result = await this.db.createApplication({
        userId,
        jobId,
        source: "telegram",
      });

      if (result.success) {
        await this.sendMessage(
          chatId,
          "✅ Ты успешно откликнулся на вакансию!\n\nОжидай ответа работодателя."
        );
      } else {
        await this.sendMessage(chatId, "❌ Ошибка при отклике на вакансию");
      }
    } catch (error) {
      console.error("[Telegram] Apply error:", error);
      await this.sendMessage(chatId, "Ошибка при отклике");
    }
  }

  /**
   * Отправить уведомление пользователю
   */
  async sendNotification(notification: TelegramNotification): Promise<boolean> {
    try {
      // Проверить, подписан ли пользователь
      const preferences = await this.db.getTelegramPreferences(notification.userId);

      if (!preferences?.notifications?.[notification.type]) {
        return false;
      }

      let text = `${this.getNotificationEmoji(notification.type)} ${notification.title}\n\n${notification.text}`;

      if (notification.actionUrl) {
        text += `\n\n🔗 ${notification.actionUrl}`;
      }

      return await this.sendMessage(notification.telegramId, text);
    } catch (error) {
      console.error("[Telegram] Notification error:", error);
      return false;
    }
  }

  /**
   * Отправить сообщение
   */
  private async sendMessage(
    chatId: number,
    text: string,
    keyboard?: any
  ): Promise<boolean> {
    try {
      const payload: any = {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      };

      if (keyboard) {
        payload.reply_markup = keyboard;
      }

      const response = await fetch(`${this.apiUrl}/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("[Telegram] Send message error:", error);
      return false;
    }
  }

  /**
   * Ответить на callback query
   */
  private async answerCallbackQuery(callbackId: string, text: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/bot${this.botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackId,
          text: text,
          show_alert: false,
        }),
      });
    } catch (error) {
      console.error("[Telegram] Callback answer error:", error);
    }
  }

  /**
   * Проверить rate limit
   */
  private checkRateLimit(chatId: number): boolean {
    const now = Date.now();
    const timestamps = this.rateLimiter.get(chatId) || [];

    // Удалить старые записи (старше 1 минуты)
    const recentTimestamps = timestamps.filter((t) => now - t < 60000);

    if (recentTimestamps.length >= this.maxMessagesPerMinute) {
      return false;
    }

    recentTimestamps.push(now);
    this.rateLimiter.set(chatId, recentTimestamps);
    return true;
  }

  /**
   * Получить emoji для типа уведомления
   */
  private getNotificationEmoji(type: string): string {
    const emojis: Record<string, string> = {
      new_job: "💼",
      accepted: "✅",
      message: "💬",
      reminder: "⏰",
    };
    return emojis[type] || "📬";
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const TelegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z
    .object({
      message_id: z.number(),
      from: z.object({
        id: z.number(),
        first_name: z.string(),
        last_name: z.string().optional(),
        username: z.string().optional(),
      }),
      chat: z.object({
        id: z.number(),
        type: z.enum(["private", "group", "supergroup", "channel"]),
      }),
      text: z.string().optional(),
    })
    .optional(),
  callback_query: z
    .object({
      id: z.string(),
      from: z.object({
        id: z.number(),
      }),
      data: z.string().optional(),
    })
    .optional(),
});
