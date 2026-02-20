import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

/**
 * Payment Integration Module
 * Поддерживает интеграцию с Qiwi, Яндекс.Деньги, WebMoney и другими платежными системами
 */

// Qiwi API Integration
export async function createQiwiPayment(phone: string, amount: number, comment: string) {
  try {
    const response = await fetch("https://api.qiwi.com/partner/bill/v1/bills/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QIWI_API_KEY}`,
      },
      body: JSON.stringify({
        amount: {
          currency: "RUB",
          value: amount.toFixed(2),
        },
        comment: comment,
        expirationDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        customer: {
          phone: phone,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Qiwi API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      paymentId: data.id,
      paymentUrl: data.payUrl,
      expiresAt: data.expirationDateTime,
    };
  } catch (error) {
    console.error("[Payment] Qiwi error:", error);
    return {
      success: false,
      error: "Failed to create Qiwi payment",
    };
  }
}

// Яндекс.Касса (YooKassa) Integration
export async function createYandexPayment(amount: number, description: string, email: string) {
  try {
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${process.env.YANDEX_SHOP_ID}:${process.env.YANDEX_API_KEY}`
        ).toString("base64")}`,
        "Idempotency-Key": `${Date.now()}-${Math.random()}`,
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency: "RUB",
        },
        payment_method_data: {
          type: "bank_card",
        },
        description: description,
        receipt: {
          customer: {
            email: email,
          },
          items: [
            {
              description: description,
              quantity: "1",
              amount: {
                value: amount.toFixed(2),
                currency: "RUB",
              },
              vat_code: 1,
            },
          ],
        },
        confirmation: {
          type: "redirect",
          return_url: `${process.env.FRONTEND_URL}/payment-success`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Yandex API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      paymentId: data.id,
      paymentUrl: data.confirmation.confirmation_url,
      status: data.status,
    };
  } catch (error) {
    console.error("[Payment] Yandex error:", error);
    return {
      success: false,
      error: "Failed to create Yandex payment",
    };
  }
}

// WebMoney Integration
export async function createWebMoneyPayment(amount: number, description: string, returnUrl: string) {
  try {
    const response = await fetch("https://merchant.webmoney.ru/lmi/payment.asp", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        LMI_MERCHANT_ID: process.env.WEBMONEY_MERCHANT_ID || "",
        LMI_PAYMENT_AMOUNT: amount.toFixed(2),
        LMI_PAYMENT_DESC: description,
        LMI_RESULT_URL: `${process.env.BACKEND_URL}/api/payment/webmoney/callback`,
        LMI_SUCCESS_URL: returnUrl,
        LMI_FAIL_URL: `${process.env.FRONTEND_URL}/payment-failed`,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`WebMoney API error: ${response.statusText}`);
    }

    return {
      success: true,
      paymentUrl: response.url,
    };
  } catch (error) {
    console.error("[Payment] WebMoney error:", error);
    return {
      success: false,
      error: "Failed to create WebMoney payment",
    };
  }
}

// Тинькофф Integration
export async function createTinkoffPayment(amount: number, description: string, email: string) {
  try {
    const response = await fetch("https://api.tinkoff.ru/v2/Init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        TerminalKey: process.env.TINKOFF_TERMINAL_KEY,
        Amount: Math.round(amount * 100), // Tinkoff expects amount in kopecks
        OrderId: `order-${Date.now()}`,
        Description: description,
        CustomerEmail: email,
        SuccessURL: `${process.env.FRONTEND_URL}/payment-success`,
        FailURL: `${process.env.FRONTEND_URL}/payment-failed`,
        NotificationURL: `${process.env.BACKEND_URL}/api/payment/tinkoff/callback`,
        Token: process.env.TINKOFF_API_KEY,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tinkoff API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      paymentId: data.PaymentId,
      paymentUrl: data.PaymentURL,
      status: data.Status,
    };
  } catch (error) {
    console.error("[Payment] Tinkoff error:", error);
    return {
      success: false,
      error: "Failed to create Tinkoff payment",
    };
  }
}

// Сбербанк Integration
export async function createSberbankPayment(amount: number, description: string, returnUrl: string) {
  try {
    const response = await fetch("https://api.sberbank.ru/payment/rest/register.do", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        userName: process.env.SBERBANK_USERNAME || "",
        password: process.env.SBERBANK_PASSWORD || "",
        orderNumber: `order-${Date.now()}`,
        amount: Math.round(amount * 100).toString(),
        currency: "810",
        returnUrl: returnUrl,
        description: description,
        jsonParams: JSON.stringify({
          email: "support@taskhive.ru",
        }),
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Sberbank API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      orderId: data.orderId,
      formUrl: data.formUrl,
      status: data.status,
    };
  } catch (error) {
    console.error("[Payment] Sberbank error:", error);
    return {
      success: false,
      error: "Failed to create Sberbank payment",
    };
  }
}

// tRPC Router for Payment Operations
export const paymentRouter = router({
  // Создание платежа через Qiwi
  createQiwiPayment: protectedProcedure
    .input(
      z.object({
        phone: z.string(),
        amount: z.number().positive(),
        comment: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await createQiwiPayment(input.phone, input.amount, input.comment);
    }),

  // Создание платежа через Яндекс.Деньги
  createYandexPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      return await createYandexPayment(input.amount, input.description, input.email);
    }),

  // Создание платежа через WebMoney
  createWebMoneyPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string(),
        returnUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      return await createWebMoneyPayment(input.amount, input.description, input.returnUrl);
    }),

  // Создание платежа через Тинькофф
  createTinkoffPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      return await createTinkoffPayment(input.amount, input.description, input.email);
    }),

  // Создание платежа через Сбербанк
  createSberbankPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string(),
        returnUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      return await createSberbankPayment(input.amount, input.description, input.returnUrl);
    }),

  // Проверка статуса платежа
  checkPaymentStatus: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
        provider: z.enum(["qiwi", "yandex", "webmoney", "tinkoff", "sberbank"]),
      })
    )
    .query(async ({ input }) => {
      // Реализация проверки статуса платежа для каждого провайдера
      return {
        status: "pending",
        amount: 0,
        createdAt: new Date(),
      };
    }),

  // Получить список доступных методов оплаты
  getPaymentMethods: publicProcedure.query(async () => {
    return [
      {
        id: "qiwi",
        name: "Qiwi",
        description: "Платеж через Qiwi кошелек",
        icon: "💳",
        enabled: !!process.env.QIWI_API_KEY,
      },
      {
        id: "yandex",
        name: "Яндекс.Деньги",
        description: "Платеж через Яндекс.Касса",
        icon: "💰",
        enabled: !!process.env.YANDEX_SHOP_ID,
      },
      {
        id: "webmoney",
        name: "WebMoney",
        description: "Платеж через WebMoney",
        icon: "💵",
        enabled: !!process.env.WEBMONEY_MERCHANT_ID,
      },
      {
        id: "tinkoff",
        name: "Тинькофф",
        description: "Платеж через Тинькофф Касса",
        icon: "🏦",
        enabled: !!process.env.TINKOFF_TERMINAL_KEY,
      },
      {
        id: "sberbank",
        name: "Сбербанк",
        description: "Платеж через Сбербанк",
        icon: "🏛️",
        enabled: !!process.env.SBERBANK_USERNAME,
      },
    ];
  }),
});
