/**
 * Payment Systems Integration
 * Поддержка российских платежных систем: Yandex.Kassa, Sber Pay, Tinkoff
 */

import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================

export type PaymentProvider = "yandex_kassa" | "sber_pay" | "tinkoff" | "robokassa" | "yandex_pay";

export interface PaymentConfig {
  provider: PaymentProvider;
  apiKey: string;
  apiSecret?: string;
  shopId?: string;
  merchantId?: string;
  terminalKey?: string;
  metadata?: Record<string, string>;
}

export interface PaymentRequest {
  amount: number; // в копейках
  currency: "RUB" | "USD";
  description: string;
  orderId: string;
  userId: string;
  metadata?: Record<string, string>;
  returnUrl?: string;
  notificationUrl?: string;
}

export interface PaymentResponse {
  id: string;
  status: "pending" | "success" | "failed" | "cancelled";
  amount: number;
  currency: string;
  provider: PaymentProvider;
  paymentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookPayload {
  provider: PaymentProvider;
  orderId: string;
  status: string;
  amount: number;
  transactionId?: string;
  timestamp: number;
  signature?: string;
}

// ============================================================================
// YANDEX.KASSA
// ============================================================================

export class YandexKassaProvider {
  private apiKey: string;
  private shopId: string;
  private apiUrl = "https://api.yookassa.ru/v3";

  constructor(config: PaymentConfig) {
    if (!config.apiKey || !config.shopId) {
      throw new Error("Yandex.Kassa requires apiKey and shopId");
    }
    this.apiKey = config.apiKey;
    this.shopId = config.shopId;
  }

  /**
   * Создать платёж
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const payload = {
      amount: {
        value: (request.amount / 100).toFixed(2),
        currency: request.currency,
      },
      description: request.description,
      metadata: {
        order_id: request.orderId,
        user_id: request.userId,
        ...request.metadata,
      },
      return_url: request.returnUrl || "https://taskhive.com/payment/success",
      confirmation: {
        type: "redirect",
        enforce: true,
      },
    };

    try {
      const response = await fetch(`${this.apiUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${this.shopId}:${this.apiKey}`).toString("base64")}`,
          "Idempotency-Key": request.orderId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Yandex.Kassa error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: data.id,
        status: this.mapStatus(data.status),
        amount: request.amount,
        currency: request.currency,
        provider: "yandex_kassa",
        paymentUrl: data.confirmation?.confirmation_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error("Yandex.Kassa payment error:", error);
      throw error;
    }
  }

  /**
   * Получить статус платежа
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.shopId}:${this.apiKey}`).toString("base64")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Yandex.Kassa error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: data.id,
        status: this.mapStatus(data.status),
        amount: data.amount.value * 100,
        currency: data.amount.currency,
        provider: "yandex_kassa",
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error("Yandex.Kassa status error:", error);
      throw error;
    }
  }

  /**
   * Проверить подпись webhook
   */
  verifyWebhook(payload: string, signature: string): boolean {
    // Yandex.Kassa использует SHA-256 HMAC
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha256", this.apiKey)
      .update(payload)
      .digest("base64");
    return hash === signature;
  }

  private mapStatus(status: string): PaymentResponse["status"] {
    const statusMap: Record<string, PaymentResponse["status"]> = {
      pending_capture: "pending",
      succeeded: "success",
      canceled: "cancelled",
      failed: "failed",
    };
    return statusMap[status] || "pending";
  }
}

// ============================================================================
// SBER PAY
// ============================================================================

export class SberPayProvider {
  private merchantId: string;
  private apiKey: string;
  private apiUrl = "https://api.sberbank.ru/api/v1";

  constructor(config: PaymentConfig) {
    if (!config.merchantId || !config.apiKey) {
      throw new Error("Sber Pay requires merchantId and apiKey");
    }
    this.merchantId = config.merchantId;
    this.apiKey = config.apiKey;
  }

  /**
   * Создать платёж
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const payload = {
      merchant_id: this.merchantId,
      amount: request.amount,
      currency_code: request.currency === "RUB" ? "643" : "840",
      order_number: request.orderId,
      order_description: request.description,
      return_url: request.returnUrl || "https://taskhive.com/payment/success",
      notification_url: request.notificationUrl,
      metadata: {
        user_id: request.userId,
        ...request.metadata,
      },
    };

    try {
      const response = await fetch(`${this.apiUrl}/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Sber Pay error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: data.payment_id,
        status: this.mapStatus(data.status),
        amount: request.amount,
        currency: request.currency,
        provider: "sber_pay",
        paymentUrl: data.payment_url,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Sber Pay error:", error);
      throw error;
    }
  }

  /**
   * Получить статус платежа
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${paymentId}/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Sber Pay error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: data.payment_id,
        status: this.mapStatus(data.status),
        amount: data.amount,
        currency: data.currency_code === "643" ? "RUB" : "USD",
        provider: "sber_pay",
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error("Sber Pay status error:", error);
      throw error;
    }
  }

  /**
   * Проверить подпись webhook
   */
  verifyWebhook(payload: string, signature: string): boolean {
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha256", this.apiKey)
      .update(payload)
      .digest("hex");
    return hash === signature;
  }

  private mapStatus(status: string): PaymentResponse["status"] {
    const statusMap: Record<string, PaymentResponse["status"]> = {
      pending: "pending",
      completed: "success",
      cancelled: "cancelled",
      failed: "failed",
    };
    return statusMap[status] || "pending";
  }
}

// ============================================================================
// TINKOFF
// ============================================================================

export class TinkoffProvider {
  private terminalKey: string;
  private password: string;
  private apiUrl = "https://api.tinkoffbank.ru/v2";

  constructor(config: PaymentConfig) {
    if (!config.terminalKey || !config.apiSecret) {
      throw new Error("Tinkoff requires terminalKey and apiSecret (password)");
    }
    this.terminalKey = config.terminalKey;
    this.password = config.apiSecret;
  }

  /**
   * Создать платёж
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const crypto = require("crypto");

    // Генерируем токен
    const token = this.generateToken({
      TerminalKey: this.terminalKey,
      Amount: request.amount,
      OrderId: request.orderId,
      Password: this.password,
    });

    const payload = {
      TerminalKey: this.terminalKey,
      Amount: request.amount,
      OrderId: request.orderId,
      Description: request.description,
      Token: token,
      NotificationURL: request.notificationUrl,
      SuccessURL: request.returnUrl || "https://taskhive.com/payment/success",
      FailURL: "https://taskhive.com/payment/failed",
      Data: {
        userId: request.userId,
        ...request.metadata,
      },
    };

    try {
      const response = await fetch(`${this.apiUrl}/Init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Tinkoff error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      if (data.ErrorCode !== "0") {
        throw new Error(`Tinkoff error: ${data.Message}`);
      }

      return {
        id: data.PaymentId.toString(),
        status: "pending",
        amount: request.amount,
        currency: request.currency,
        provider: "tinkoff",
        paymentUrl: data.PaymentURL,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Tinkoff payment error:", error);
      throw error;
    }
  }

  /**
   * Получить статус платежа
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    const token = this.generateToken({
      TerminalKey: this.terminalKey,
      PaymentId: paymentId,
      Password: this.password,
    });

    try {
      const response = await fetch(`${this.apiUrl}/GetState`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TerminalKey: this.terminalKey,
          PaymentId: paymentId,
          Token: token,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tinkoff error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      if (data.ErrorCode !== "0") {
        throw new Error(`Tinkoff error: ${data.Message}`);
      }

      return {
        id: data.PaymentId.toString(),
        status: this.mapStatus(data.Status),
        amount: data.Amount,
        currency: "RUB",
        provider: "tinkoff",
        createdAt: new Date(data.DateCreate),
        updatedAt: new Date(data.DateUpdate),
      };
    } catch (error) {
      console.error("Tinkoff status error:", error);
      throw error;
    }
  }

  /**
   * Проверить подпись webhook
   */
  verifyWebhook(payload: Record<string, string>, signature: string): boolean {
    const token = this.generateToken(payload);
    return token === signature;
  }

  private generateToken(data: Record<string, string | number>): string {
    const crypto = require("crypto");
    const values = Object.values(data).sort().join("");
    return crypto.createHash("sha256").update(values).digest("hex");
  }

  private mapStatus(status: string): PaymentResponse["status"] {
    const statusMap: Record<string, PaymentResponse["status"]> = {
      NEW: "pending",
      FORM_SHOWED: "pending",
      AUTHORIZED: "pending",
      CONFIRMED: "success",
      REFUNDED: "cancelled",
      PARTIAL_REFUNDED: "cancelled",
      CANCELED: "cancelled",
      REJECTED: "failed",
      "3DS_CHECKING": "pending",
      "3DS_CHECKED": "pending",
    };
    return statusMap[status] || "pending";
  }
}

// ============================================================================
// ROBOKASSA
// ============================================================================

export class RobokassaProvider {
  private merchantLogin: string;
  private password1: string;
  private password2: string;
  private testMode: boolean;
  private apiUrl = "https://merchant.roboxchange.com/MerchantInterface/MerchantGateway.aspx";

  constructor(config: PaymentConfig) {
    if (!config.apiKey || !config.apiSecret) {
      throw new Error("Robokassa requires apiKey (merchantLogin) and apiSecret (password1)");
    }
    this.merchantLogin = config.apiKey;
    this.password1 = config.apiSecret;
    this.password2 = config.metadata?.password2 || "";
    this.testMode = config.metadata?.testMode === "true";
  }

  /**
   * Создать платёж
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const crypto = require("crypto");
    const sum = (request.amount / 100).toFixed(2);
    const invId = request.orderId;
    const signature = crypto
      .createHash("md5")
      .update(`${this.merchantLogin}:${sum}:${invId}:${this.password1}`)
      .digest("hex");

    const params = new URLSearchParams({
      MerchantLogin: this.merchantLogin,
      Sum: sum,
      InvId: invId,
      Description: request.description,
      SignatureValue: signature,
      IsTest: this.testMode ? "1" : "0",
      ReturnURL: request.returnUrl || "https://taskhive.com/payment/success",
      NotificationURL: request.notificationUrl || "",
    });

    const paymentUrl = `${this.apiUrl}?${params.toString()}`;

    return {
      id: invId,
      status: "pending",
      amount: request.amount,
      currency: request.currency,
      provider: "robokassa",
      paymentUrl: paymentUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Получить статус платежа (не поддерживается Robokassa)
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    throw new Error("Robokassa does not support payment status queries. Use webhook notifications.");
  }

  /**
   * Проверить подпись webhook
   */
  verifyWebhook(payload: Record<string, string>, signature: string): boolean {
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHash("md5")
      .update(
        `${payload.Sum}:${payload.InvId}:${this.password2}`
      )
      .digest("hex")
      .toUpperCase();
    return expectedSignature === signature.toUpperCase();
  }
}

// ============================================================================
// YANDEX PAY
// ============================================================================

export class YandexPayProvider {
  private apiKey: string;
  private merchantId: string;
  private apiUrl = "https://api.yandex.pay/v1";

  constructor(config: PaymentConfig) {
    if (!config.apiKey || !config.merchantId) {
      throw new Error("Yandex Pay requires apiKey and merchantId");
    }
    this.apiKey = config.apiKey;
    this.merchantId = config.merchantId;
  }

  /**
   * Создать платёж
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const payload = {
      data: {
        merchant: {
          id: this.merchantId,
        },
        order: {
          id: request.orderId,
          amount: {
            value: (request.amount / 100).toFixed(2),
            currency: request.currency,
          },
          description: request.description,
        },
        checkout: {
          returnUrl: request.returnUrl || "https://taskhive.com/payment/success",
        },
      },
    };

    try {
      const response = await fetch(`${this.apiUrl}/payment-sheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "Idempotency-Key": request.orderId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Yandex Pay error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: data.paymentSheet?.id || request.orderId,
        status: "pending",
        amount: request.amount,
        currency: request.currency,
        provider: "yandex_pay",
        paymentUrl: data.paymentSheet?.url,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Yandex Pay error:", error);
      throw error;
    }
  }

  /**
   * Получить статус платежа
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Yandex Pay error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: data.id,
        status: this.mapStatus(data.status),
        amount: Math.round(parseFloat(data.order.amount.value) * 100),
        currency: data.order.amount.currency,
        provider: "yandex_pay",
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error("Yandex Pay status error:", error);
      throw error;
    }
  }

  /**
   * Проверить подпись webhook
   */
  verifyWebhook(payload: string, signature: string): boolean {
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha256", this.apiKey)
      .update(payload)
      .digest("base64");
    return hash === signature;
  }

  private mapStatus(status: string): PaymentResponse["status"] {
    const statusMap: Record<string, PaymentResponse["status"]> = {
      pending: "pending",
      succeeded: "success",
      failed: "failed",
      cancelled: "cancelled",
    };
    return statusMap[status] || "pending";
  }
}

// ============================================================================
// PAYMENT MANAGER
// ============================================================================

export class PaymentManager {
  private providers: Map<PaymentProvider, any> = new Map();

  constructor(configs: PaymentConfig[]) {
    for (const config of configs) {
      this.registerProvider(config);
    }
  }

  private registerProvider(config: PaymentConfig): void {
    switch (config.provider) {
      case "yandex_kassa":
        this.providers.set("yandex_kassa", new YandexKassaProvider(config) as any);
        break;
      case "sber_pay":
        this.providers.set("sber_pay", new SberPayProvider(config) as any);
        break;
      case "tinkoff":
        this.providers.set("tinkoff", new TinkoffProvider(config) as any);
        break;
      case "robokassa":
        this.providers.set("robokassa", new RobokassaProvider(config) as any);
        break;
      case "yandex_pay":
        this.providers.set("yandex_pay", new YandexPayProvider(config) as any);
        break;
    }
  }

  /**
   * Создать платёж через указанного провайдера
   */
  async createPayment(
    provider: PaymentProvider,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new Error(`Payment provider ${provider} not configured`);
    }

    return (paymentProvider as any).createPayment(request);
  }

  /**
   * Получить статус платежа
   */
  async getPaymentStatus(
    provider: PaymentProvider,
    paymentId: string
  ): Promise<PaymentResponse> {
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new Error(`Payment provider ${provider} not configured`);
    }

    return (paymentProvider as any).getPaymentStatus(paymentId);
  }

  /**
   * Проверить webhook
   */
  verifyWebhook(provider: PaymentProvider, payload: string, signature: string): boolean {
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new Error(`Payment provider ${provider} not configured`);
    }

    return (paymentProvider as any).verifyWebhook(payload, signature);
  }

  /**
   * Получить список доступных провайдеров
   */
  getAvailableProviders(): PaymentProvider[] {
    return Array.from(this.providers.keys());
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const PaymentRequestSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(["RUB" as const, "USD" as const]),
  description: z.string().min(1),
  orderId: z.string().min(1),
  userId: z.string().min(1),
  metadata: z.record(z.string(), z.string()).optional(),
  returnUrl: z.string().url().optional(),
  notificationUrl: z.string().url().optional(),
});

export const PaymentConfigSchema = z.object({
  provider: z.enum(["yandex_kassa" as const, "sber_pay" as const, "tinkoff" as const, "robokassa" as const, "yandex_pay" as const]),
  apiKey: z.string().min(1),
  apiSecret: z.string().optional(),
  shopId: z.string().optional(),
  merchantId: z.string().optional(),
  terminalKey: z.string().optional(),
});
