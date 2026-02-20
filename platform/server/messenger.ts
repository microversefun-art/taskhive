import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

/**
 * Messenger Integration Module
 * Поддерживает интеграцию с Telegram, VK, Mail.ru и другими мессенджерами
 */

// Telegram Bot Integration
export async function sendTelegramMessage(chatId: string, message: string, parseMode: string = "HTML") {
  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.result.message_id,
    };
  } catch (error) {
    console.error("[Messenger] Telegram error:", error);
    return {
      success: false,
      error: "Failed to send Telegram message",
    };
  }
}

// VK API Integration
export async function sendVKMessage(userId: number, message: string) {
  try {
    const response = await fetch("https://api.vk.com/method/messages.send", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        user_id: userId.toString(),
        message: message,
        access_token: process.env.VK_API_TOKEN || "",
        v: "5.131",
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`VK API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`VK API error: ${data.error.error_msg}`);
    }

    return {
      success: true,
      messageId: data.response,
    };
  } catch (error) {
    console.error("[Messenger] VK error:", error);
    return {
      success: false,
      error: "Failed to send VK message",
    };
  }
}

// Mail.ru Agent Integration
export async function sendMailRuMessage(userId: string, message: string) {
  try {
    const response = await fetch("https://agent.mail.ru/bot/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAILRU_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        user_id: userId,
        text: message,
        type: "text",
      }),
    });

    if (!response.ok) {
      throw new Error(`Mail.ru API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.message_id,
    };
  } catch (error) {
    console.error("[Messenger] Mail.ru error:", error);
    return {
      success: false,
      error: "Failed to send Mail.ru message",
    };
  }
}

// WhatsApp Integration (via Twilio)
export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        From: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || ""}`,
        To: `whatsapp:${phoneNumber}`,
        Body: message,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.sid,
    };
  } catch (error) {
    console.error("[Messenger] WhatsApp error:", error);
    return {
      success: false,
      error: "Failed to send WhatsApp message",
    };
  }
}

// Viber Integration
export async function sendViberMessage(phoneNumber: string, message: string) {
  try {
    const response = await fetch("https://chatapi.viber.com/pa/send_message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Viber-Auth-Token": process.env.VIBER_AUTH_TOKEN || "",
      },
      body: JSON.stringify({
        receiver: phoneNumber,
        min_api_version: 1,
        sender: {
          name: "TaskHive",
          avatar: "https://taskhive.ru/logo.png",
        },
        type: "text",
        text: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Viber API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.message_token,
    };
  } catch (error) {
    console.error("[Messenger] Viber error:", error);
    return {
      success: false,
      error: "Failed to send Viber message",
    };
  }
}

// Email Integration (via SendGrid or similar)
export async function sendEmailMessage(email: string, subject: string, htmlContent: string) {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: email,
              },
            ],
          },
        ],
        from: {
          email: "noreply@taskhive.ru",
          name: "TaskHive",
        },
        subject: subject,
        content: [
          {
            type: "text/html",
            value: htmlContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }

    return {
      success: true,
      messageId: response.headers.get("X-Message-Id"),
    };
  } catch (error) {
    console.error("[Messenger] Email error:", error);
    return {
      success: false,
      error: "Failed to send email",
    };
  }
}

// tRPC Router for Messenger Operations
export const messengerRouter = router({
  // Отправить сообщение в Telegram
  sendTelegramMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await sendTelegramMessage(input.chatId, input.message);
    }),

  // Отправить сообщение в VK
  sendVKMessage: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await sendVKMessage(input.userId, input.message);
    }),

  // Отправить сообщение в Mail.ru
  sendMailRuMessage: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await sendMailRuMessage(input.userId, input.message);
    }),

  // Отправить сообщение в WhatsApp
  sendWhatsAppMessage: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await sendWhatsAppMessage(input.phoneNumber, input.message);
    }),

  // Отправить сообщение в Viber
  sendViberMessage: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await sendViberMessage(input.phoneNumber, input.message);
    }),

  // Отправить email
  sendEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        subject: z.string(),
        htmlContent: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await sendEmailMessage(input.email, input.subject, input.htmlContent);
    }),

  // Получить список доступных мессенджеров
  getAvailableMessengers: publicProcedure.query(async () => {
    return [
      {
        id: "telegram",
        name: "Telegram",
        description: "Отправка уведомлений через Telegram",
        icon: "📱",
        enabled: !!process.env.TELEGRAM_BOT_TOKEN,
      },
      {
        id: "vk",
        name: "VK",
        description: "Отправка сообщений через VK",
        icon: "👥",
        enabled: !!process.env.VK_API_TOKEN,
      },
      {
        id: "mailru",
        name: "Mail.ru Agent",
        description: "Отправка сообщений через Mail.ru",
        icon: "📧",
        enabled: !!process.env.MAILRU_BOT_TOKEN,
      },
      {
        id: "whatsapp",
        name: "WhatsApp",
        description: "Отправка сообщений через WhatsApp",
        icon: "💬",
        enabled: !!process.env.TWILIO_ACCOUNT_SID,
      },
      {
        id: "viber",
        name: "Viber",
        description: "Отправка сообщений через Viber",
        icon: "📞",
        enabled: !!process.env.VIBER_AUTH_TOKEN,
      },
      {
        id: "email",
        name: "Email",
        description: "Отправка уведомлений по email",
        icon: "✉️",
        enabled: !!process.env.SENDGRID_API_KEY,
      },
    ];
  }),
});
