/**
 * Withdrawal Service
 * Система вывода денег
 */

import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================

export type WithdrawalStatus = "pending" | "approved" | "processing" | "completed" | "rejected" | "cancelled";

export type PaymentMethod = "bank_transfer" | "card" | "wallet" | "yandex_kassa" | "sber_pay" | "tinkoff";

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number; // в копейках
  currency: "RUB" | "USD";
  paymentMethod: PaymentMethod;
  status: WithdrawalStatus;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    bic: string;
  };
  cardDetails?: {
    cardNumber: string; // последние 4 цифры
    cardholderName: string;
  };
  walletAddress?: string;
  commission: number; // комиссия в копейках
  netAmount: number; // сумма после комиссии
  transactionId?: string;
  failureReason?: string;
  createdAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export interface WithdrawalLimits {
  userId: string;
  dailyLimit: number;
  monthlyLimit: number;
  dailyUsed: number;
  monthlyUsed: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  lastReset: Date;
}

export interface WithdrawalCommission {
  method: PaymentMethod;
  percentage: number; // % от суммы
  fixed: number; // фиксированная сумма в копейках
  minCommission: number;
  maxCommission: number;
}

// ============================================================================
// WITHDRAWAL SERVICE
// ============================================================================

export class WithdrawalService {
  private commissions: Map<PaymentMethod, WithdrawalCommission> = new Map([
    [
      "bank_transfer",
      {
        method: "bank_transfer",
        percentage: 0.5,
        fixed: 0,
        minCommission: 0,
        maxCommission: 50000, // 500 рублей
      },
    ],
    [
      "card",
      {
        method: "card",
        percentage: 1,
        fixed: 0,
        minCommission: 0,
        maxCommission: 100000, // 1000 рублей
      },
    ],
    [
      "yandex_kassa",
      {
        method: "yandex_kassa",
        percentage: 2,
        fixed: 0,
        minCommission: 0,
        maxCommission: 200000, // 2000 рублей
      },
    ],
    [
      "sber_pay",
      {
        method: "sber_pay",
        percentage: 1.5,
        fixed: 0,
        minCommission: 0,
        maxCommission: 150000, // 1500 рублей
      },
    ],
    [
      "tinkoff",
      {
        method: "tinkoff",
        percentage: 1,
        fixed: 0,
        minCommission: 0,
        maxCommission: 100000, // 1000 рублей
      },
    ],
  ]);

  private limits: WithdrawalLimits = {
    userId: "",
    dailyLimit: 50000000, // 500,000 рублей
    monthlyLimit: 500000000, // 5,000,000 рублей
    dailyUsed: 0,
    monthlyUsed: 0,
    minWithdrawal: 10000, // 100 рублей
    maxWithdrawal: 50000000, // 500,000 рублей
    lastReset: new Date(),
  };

  /**
   * Создать заявку на вывод
   */
  createWithdrawal(
    userId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    bankDetails?: any,
    cardDetails?: any,
    walletAddress?: string
  ): Withdrawal {
    const commission = this.calculateCommission(amount, paymentMethod);
    const netAmount = amount - commission;

    return {
      id: `withdrawal-${Date.now()}-${Math.random()}`,
      userId,
      amount,
      currency: "RUB",
      paymentMethod,
      status: "pending",
      bankDetails,
      cardDetails,
      walletAddress,
      commission,
      netAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Рассчитать комиссию
   */
  calculateCommission(amount: number, paymentMethod: PaymentMethod): number {
    const commission = this.commissions.get(paymentMethod);
    if (!commission) throw new Error(`Unknown payment method: ${paymentMethod}`);

    const percentageCommission = Math.floor((amount * commission.percentage) / 100);
    const totalCommission = percentageCommission + commission.fixed;

    return Math.max(
      commission.minCommission,
      Math.min(commission.maxCommission, totalCommission)
    );
  }

  /**
   * Проверить возможность вывода
   */
  canWithdraw(
    amount: number,
    userBalance: number,
    dailyUsed: number,
    monthlyUsed: number
  ): { canWithdraw: boolean; reason?: string } {
    // Проверить минимальную сумму
    if (amount < this.limits.minWithdrawal) {
      return {
        canWithdraw: false,
        reason: `Минимальная сумма вывода: ${this.limits.minWithdrawal / 100} ₽`,
      };
    }

    // Проверить максимальную сумму
    if (amount > this.limits.maxWithdrawal) {
      return {
        canWithdraw: false,
        reason: `Максимальная сумма вывода: ${this.limits.maxWithdrawal / 100} ₽`,
      };
    }

    // Проверить баланс
    if (amount > userBalance) {
      return {
        canWithdraw: false,
        reason: "Недостаточно средств на счёте",
      };
    }

    // Проверить дневной лимит
    if (dailyUsed + amount > this.limits.dailyLimit) {
      const remaining = this.limits.dailyLimit - dailyUsed;
      return {
        canWithdraw: false,
        reason: `Превышен дневной лимит. Осталось: ${remaining / 100} ₽`,
      };
    }

    // Проверить месячный лимит
    if (monthlyUsed + amount > this.limits.monthlyLimit) {
      const remaining = this.limits.monthlyLimit - monthlyUsed;
      return {
        canWithdraw: false,
        reason: `Превышен месячный лимит. Осталось: ${remaining / 100} ₽`,
      };
    }

    return { canWithdraw: true };
  }

  /**
   * Одобрить вывод
   */
  approveWithdrawal(withdrawal: Withdrawal): Withdrawal {
    return {
      ...withdrawal,
      status: "approved",
      approvedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Отклонить вывод
   */
  rejectWithdrawal(withdrawal: Withdrawal, reason: string): Withdrawal {
    return {
      ...withdrawal,
      status: "rejected",
      failureReason: reason,
      updatedAt: new Date(),
    };
  }

  /**
   * Отметить вывод как выполненный
   */
  completeWithdrawal(withdrawal: Withdrawal, transactionId: string): Withdrawal {
    return {
      ...withdrawal,
      status: "completed",
      transactionId,
      completedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Получить комиссии для всех методов
   */
  getCommissions(): WithdrawalCommission[] {
    return Array.from(this.commissions.values());
  }

  /**
   * Получить лимиты
   */
  getLimits(): WithdrawalLimits {
    return this.limits;
  }

  /**
   * Установить лимиты
   */
  setLimits(limits: Partial<WithdrawalLimits>): void {
    this.limits = { ...this.limits, ...limits };
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const WithdrawalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number().positive(),
  currency: z.enum(["RUB" as const, "USD" as const]),
  paymentMethod: z.enum([
    "bank_transfer" as const,
    "card" as const,
    "wallet" as const,
    "yandex_kassa" as const,
    "sber_pay" as const,
    "tinkoff" as const,
  ]),
  status: z.enum([
    "pending" as const,
    "approved" as const,
    "processing" as const,
    "completed" as const,
    "rejected" as const,
    "cancelled" as const,
  ]),
  bankDetails: z
    .object({
      accountNumber: z.string(),
      bankName: z.string(),
      bic: z.string(),
    })
    .optional(),
  cardDetails: z
    .object({
      cardNumber: z.string(),
      cardholderName: z.string(),
    })
    .optional(),
  walletAddress: z.string().optional(),
  commission: z.number(),
  netAmount: z.number(),
  transactionId: z.string().optional(),
  failureReason: z.string().optional(),
  createdAt: z.date(),
  approvedAt: z.date().optional(),
  completedAt: z.date().optional(),
  updatedAt: z.date(),
});

export const CreateWithdrawalSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum([
    "bank_transfer" as const,
    "card" as const,
    "wallet" as const,
    "yandex_kassa" as const,
    "sber_pay" as const,
    "tinkoff" as const,
  ]),
  bankDetails: z
    .object({
      accountNumber: z.string(),
      bankName: z.string(),
      bic: z.string(),
    })
    .optional(),
  cardDetails: z
    .object({
      cardNumber: z.string(),
      cardholderName: z.string(),
    })
    .optional(),
  walletAddress: z.string().optional(),
});
