import { z } from 'zod';

/**
 * AI Accountant System
 * Автоматизация бухгалтерии и отчётности
 */

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['income', 'expense', 'withdrawal', 'refund']),
  amount: z.number(),
  description: z.string(),
  category: z.string(),
  date: z.date(),
  status: z.enum(['pending', 'completed', 'failed']),
  taxable: z.boolean(),
  taxRate: z.number().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export const FinancialReportSchema = z.object({
  userId: z.string(),
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  startDate: z.date(),
  endDate: z.date(),
  totalIncome: z.number(),
  totalExpenses: z.number(),
  totalTaxes: z.number(),
  netIncome: z.number(),
  transactions: z.array(TransactionSchema),
  categories: z.record(z.string(), z.number()),
});

export type FinancialReport = z.infer<typeof FinancialReportSchema>;

export class AIAccountant {
  /**
   * Автоматически классифицировать транзакцию
   */
  static classifyTransaction(description: string): {
    category: string;
    taxable: boolean;
    taxRate: number;
  } {
    const keywords: Record<string, { category: string; taxable: boolean; taxRate: number }> = {
      'курьер': { category: 'Доставка', taxable: true, taxRate: 13 },
      'дизайн': { category: 'Фриланс', taxable: true, taxRate: 13 },
      'видео': { category: 'Контент', taxable: true, taxRate: 13 },
      'копирайт': { category: 'Контент', taxable: true, taxRate: 13 },
      'консультация': { category: 'Услуги', taxable: true, taxRate: 13 },
      'комиссия': { category: 'Комиссия', taxable: false, taxRate: 0 },
      'бонус': { category: 'Бонус', taxable: true, taxRate: 13 },
      'возврат': { category: 'Возврат', taxable: false, taxRate: 0 },
    };

    for (const [keyword, info] of Object.entries(keywords)) {
      if (description.toLowerCase().includes(keyword)) {
        return info;
      }
    }

    return { category: 'Прочее', taxable: true, taxRate: 13 };
  }

  /**
   * Рассчитать налоги
   */
  static calculateTaxes(transactions: Transaction[]): {
    totalTaxable: number;
    totalTaxes: number;
    byCategory: Record<string, { amount: number; tax: number }>;
  } {
    const byCategory: Record<string, { amount: number; tax: number }> = {};
    let totalTaxable = 0;
    let totalTaxes = 0;

    for (const tx of transactions) {
      if (!tx.taxable || tx.type !== 'income') continue;

      const taxRate = tx.taxRate || 13;
      const tax = Math.round(tx.amount * (taxRate / 100));

      totalTaxable += tx.amount;
      totalTaxes += tax;

      if (!byCategory[tx.category]) {
        byCategory[tx.category] = { amount: 0, tax: 0 };
      }
      byCategory[tx.category].amount += tx.amount;
      byCategory[tx.category].tax += tax;
    }

    return { totalTaxable, totalTaxes, byCategory };
  }

  /**
   * Сгенерировать финансовый отчёт
   */
  static generateFinancialReport(
    userId: string,
    transactions: Transaction[],
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  ): FinancialReport {
    const now = new Date();
    let startDate = new Date(now);

    switch (period) {
      case 'daily':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const periodTransactions = transactions.filter(
      tx => tx.date >= startDate && tx.date <= now && tx.status === 'completed'
    );

    const totalIncome = periodTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpenses = periodTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const taxes = this.calculateTaxes(periodTransactions);
    const totalTaxes = taxes.totalTaxes;

    const netIncome = totalIncome - totalExpenses - totalTaxes;

    const categories: Record<string, number> = {};
    for (const tx of periodTransactions) {
      if (!categories[tx.category]) {
        categories[tx.category] = 0;
      }
      categories[tx.category] += tx.amount;
    }

    return {
      userId,
      period,
      startDate,
      endDate: now,
      totalIncome,
      totalExpenses,
      totalTaxes,
      netIncome,
      transactions: periodTransactions,
      categories,
    };
  }

  /**
   * Сгенерировать УПД (Универсальный передаточный документ)
   */
  static generateUPD(
    executorName: string,
    executorINN: string,
    amount: number,
    description: string,
    date: Date
  ): {
    documentNumber: string;
    documentDate: string;
    seller: { name: string; inn: string };
    buyer: { name: string };
    amount: number;
    tax: number;
    total: number;
    description: string;
  } {
    const tax = Math.round(amount * 0.13);
    const total = amount + tax;
    const docNumber = `УПД-${Date.now()}`;

    return {
      documentNumber: docNumber,
      documentDate: date.toISOString().split('T')[0],
      seller: { name: executorName, inn: executorINN },
      buyer: { name: 'TaskHive Platform' },
      amount,
      tax,
      total,
      description,
    };
  }

  /**
   * Сгенерировать счёт-фактуру
   */
  static generateInvoice(
    executorName: string,
    executorINN: string,
    amount: number,
    description: string,
    date: Date
  ): {
    invoiceNumber: string;
    invoiceDate: string;
    seller: { name: string; inn: string };
    buyer: { name: string };
    items: Array<{ description: string; quantity: number; price: number; amount: number }>;
    subtotal: number;
    tax: number;
    total: number;
  } {
    const tax = Math.round(amount * 0.18);
    const total = amount + tax;
    const invNumber = `СЧ-${Date.now()}`;

    return {
      invoiceNumber: invNumber,
      invoiceDate: date.toISOString().split('T')[0],
      seller: { name: executorName, inn: executorINN },
      buyer: { name: 'TaskHive Platform' },
      items: [
        {
          description,
          quantity: 1,
          price: amount,
          amount,
        },
      ],
      subtotal: amount,
      tax,
      total,
    };
  }

  /**
   * Интегрировать с 1С (экспорт данных)
   */
  static export1C(report: FinancialReport): string {
    const csv = [
      ['Дата', 'Описание', 'Категория', 'Тип', 'Сумма', 'Налог', 'Статус'].join(';'),
      ...report.transactions.map(tx => [
        tx.date.toISOString().split('T')[0],
        tx.description,
        tx.category,
        tx.type,
        tx.amount,
        tx.taxable ? Math.round(tx.amount * (tx.taxRate || 13) / 100) : 0,
        tx.status,
      ].join(';')),
    ].join('\n');

    return csv;
  }

  /**
   * Получить аналитику доходов
   */
  static getIncomeAnalytics(transactions: Transaction[]): {
    averageDailyIncome: number;
    highestDay: { date: Date; amount: number };
    lowestDay: { date: Date; amount: number };
    trend: 'up' | 'down' | 'stable';
    forecast30Days: number;
  } {
    const incomeByDay: Record<string, number> = {};

    for (const tx of transactions) {
      if (tx.type !== 'income') continue;

      const dateStr = tx.date.toISOString().split('T')[0];
      incomeByDay[dateStr] = (incomeByDay[dateStr] || 0) + tx.amount;
    }

    const days = Object.entries(incomeByDay);
    const totalIncome = days.reduce((sum, [, amount]) => sum + amount, 0);
    const averageDailyIncome = days.length > 0 ? Math.round(totalIncome / days.length) : 0;

    const [highestDay] = days.sort(([, a], [, b]) => b - a);
    const [lowestDay] = days.sort(([, a], [, b]) => a - b);

    // Простой тренд
    const recentDays = days.slice(-7);
    const olderDays = days.slice(-14, -7);
    const recentAvg = recentDays.reduce((sum, [, a]) => sum + a, 0) / (recentDays.length || 1);
    const olderAvg = olderDays.reduce((sum, [, a]) => sum + a, 0) / (olderDays.length || 1);

    const trend = recentAvg > olderAvg * 1.1 ? 'up' : recentAvg < olderAvg * 0.9 ? 'down' : 'stable';

    return {
      averageDailyIncome,
      highestDay: {
        date: new Date(highestDay?.[0] || ''),
        amount: highestDay?.[1] || 0,
      },
      lowestDay: {
        date: new Date(lowestDay?.[0] || ''),
        amount: lowestDay?.[1] || 0,
      },
      trend,
      forecast30Days: Math.round(averageDailyIncome * 30),
    };
  }
}

// tRPC процедуры для бухгалтера
export const accountantProcedures = {
  classifyTransaction: (description: string) => {
    return AIAccountant.classifyTransaction(description);
  },

  calculateTaxes: (transactions: Transaction[]) => {
    return AIAccountant.calculateTaxes(transactions);
  },

  generateReport: (
    userId: string,
    transactions: Transaction[],
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  ) => {
    return AIAccountant.generateFinancialReport(userId, transactions, period);
  },

  generateUPD: (
    executorName: string,
    executorINN: string,
    amount: number,
    description: string,
    date: Date
  ) => {
    return AIAccountant.generateUPD(executorName, executorINN, amount, description, date);
  },

  generateInvoice: (
    executorName: string,
    executorINN: string,
    amount: number,
    description: string,
    date: Date
  ) => {
    return AIAccountant.generateInvoice(executorName, executorINN, amount, description, date);
  },

  export1C: (report: FinancialReport) => {
    return AIAccountant.export1C(report);
  },

  getIncomeAnalytics: (transactions: Transaction[]) => {
    return AIAccountant.getIncomeAnalytics(transactions);
  },
};
