import { getDb } from "../db";
import { recurringOrders, recurringOrderHistory } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export type RecurringFrequency = "daily" | "weekly" | "biweekly" | "monthly";

export class RecurringOrdersManager {
  /**
   * Создать повторяющийся заказ
   */
  static async createRecurringOrder(
    clientId: number,
    executorId: number,
    jobId: number,
    frequency: RecurringFrequency,
    discount: number = 10
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Валидация скидки (10-30%)
    const validDiscount = Math.min(30, Math.max(10, discount));

    // Рассчитать дату следующего заказа
    const nextOrderDate = this.calculateNextOrderDate(frequency);

    const result = await db.insert(recurringOrders).values({
      clientId,
      executorId,
      jobId,
      frequency,
      discount: validDiscount,
      status: "active",
      nextOrderDate,
    });

    return {
      id: (result as any)[0].insertId,
      clientId,
      executorId,
      jobId,
      frequency,
      discount: validDiscount,
      status: "active",
      nextOrderDate,
    };
  }

  /**
   * Обработать повторяющиеся заказы по расписанию
   */
  static async processRecurringOrders() {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const now = new Date();

    // Получить все активные заказы
    const activeOrders = await db
      .select()
      .from(recurringOrders)
      .where(eq(recurringOrders.status, "active"));

    const processed = [];

    for (const order of activeOrders) {
      if (order.nextOrderDate && new Date(order.nextOrderDate) <= now) {
        // Создать запись в истории
        const originalPrice = 1000;
        const discountedPrice = Math.round(originalPrice * (1 - order.discount / 100));
        const savings = originalPrice - discountedPrice;

        await db.insert(recurringOrderHistory).values({
          recurringOrderId: order.id,
          orderNumber: (order.totalOrders || 0) + 1,
          originalPrice: originalPrice.toString(),
          discountedPrice: discountedPrice.toString(),
          savings: savings.toString(),
          status: "completed",
          completedAt: new Date(),
        });

        // Обновить счётчики
        const newTotalOrders = (order.totalOrders || 0) + 1;
        const newTotalSavings = (order.totalSavings ? parseFloat(order.totalSavings.toString()) : 0) + savings;

        await db
          .update(recurringOrders)
          .set({
            totalOrders: newTotalOrders,
            totalSavings: newTotalSavings.toString(),
            nextOrderDate: this.calculateNextOrderDate(order.frequency),
          })
          .where(eq(recurringOrders.id, order.id));

        processed.push(order.id);
      }
    }

    return { processed, count: processed.length };
  }

  /**
   * Пауза повторяющегося заказа
   */
  static async pauseRecurringOrder(recurringOrderId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(recurringOrders)
      .set({ status: "paused" })
      .where(eq(recurringOrders.id, recurringOrderId));

    return { success: true };
  }

  /**
   * Возобновить повторяющийся заказ
   */
  static async resumeRecurringOrder(recurringOrderId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(recurringOrders)
      .set({ status: "active" })
      .where(eq(recurringOrders.id, recurringOrderId));

    return { success: true };
  }

  /**
   * Отменить повторяющийся заказ
   */
  static async cancelRecurringOrder(recurringOrderId: number, reason: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(recurringOrders)
      .set({
        status: "cancelled",
        cancelledReason: reason,
        cancelledAt: new Date(),
      })
      .where(eq(recurringOrders.id, recurringOrderId));

    return { success: true };
  }

  /**
   * Получить повторяющиеся заказы пользователя
   */
  static async getUserRecurringOrders(userId: number, type: "client" | "executor") {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    if (type === "client") {
      return await db
        .select()
        .from(recurringOrders)
        .where(eq(recurringOrders.clientId, userId))
        .orderBy(desc(recurringOrders.createdAt));
    } else {
      return await db
        .select()
        .from(recurringOrders)
        .where(eq(recurringOrders.executorId, userId))
        .orderBy(desc(recurringOrders.createdAt));
    }
  }

  /**
   * Получить историю повторяющегося заказа
   */
  static async getRecurringOrderHistory(recurringOrderId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(recurringOrderHistory)
      .where(eq(recurringOrderHistory.recurringOrderId, recurringOrderId))
      .orderBy(desc(recurringOrderHistory.createdAt));
  }

  /**
   * Получить статистику повторяющегося заказа
   */
  static async getStats(recurringOrderId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const order = await db
      .select()
      .from(recurringOrders)
      .where(eq(recurringOrders.id, recurringOrderId))
      .limit(1);

    if (order.length === 0) {
      throw new Error("Recurring order not found");
    }

    const rec = order[0];

    return {
      id: rec.id,
      frequency: rec.frequency,
      discount: rec.discount,
      status: rec.status,
      totalOrders: rec.totalOrders || 0,
      totalSavings: rec.totalSavings ? parseFloat(rec.totalSavings.toString()) : 0,
      nextOrderDate: rec.nextOrderDate,
      createdAt: rec.createdAt,
    };
  }

  /**
   * Рассчитать дату следующего заказа
   */
  private static calculateNextOrderDate(frequency: RecurringFrequency): Date {
    const now = new Date();

    switch (frequency) {
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "biweekly":
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      case "monthly":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  }
}
