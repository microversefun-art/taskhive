import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { escrowTransactions, jobs, users } from "../../drizzle/schema";

export class EscrowManager {
  /**
   * Создать эскроу-транзакцию
   */
  async createEscrow(
    jobId: number,
    clientId: number,
    executorId: number,
    amount: number,
    paymentMethod: string
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const transaction = await db.insert(escrowTransactions).values({
      jobId,
      clientId,
      executorId,
      amount,
      status: "pending",
      paymentMethod,
    });

    return transaction;
  }

  /**
   * Удержать деньги на эскроу
   */
  async holdEscrow(escrowId: number, paymentId: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const escrow = await db
      .update(escrowTransactions)
      .set({
        status: "held",
        paymentId,
        updatedAt: new Date(),
      })
      .where(eq(escrowTransactions.id, escrowId));

    return escrow;
  }

  /**
   * Выпустить деньги исполнителю
   */
  async releaseEscrow(escrowId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const escrow = await db
      .update(escrowTransactions)
      .set({
        status: "released",
        releaseDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(escrowTransactions.id, escrowId));

    return escrow;
  }

  /**
   * Вернуть деньги клиенту
   */
  async refundEscrow(escrowId: number, reason: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const escrow = await db
      .update(escrowTransactions)
      .set({
        status: "refunded",
        disputeReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(escrowTransactions.id, escrowId));

    return escrow;
  }

  /**
   * Открыть спор
   */
  async openDispute(escrowId: number, reason: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const escrow = await db
      .update(escrowTransactions)
      .set({
        status: "disputed",
        disputeReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(escrowTransactions.id, escrowId));

    return escrow;
  }

  /**
   * Решить спор
   */
  async resolveDispute(
    escrowId: number,
    result: "client_win" | "executor_win" | "split",
    notes: string
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const escrow = await db
      .update(escrowTransactions)
      .set({
        arbitrationResult: result,
        arbitrationNotes: notes,
        status: result === "client_win" ? "refunded" : "released",
        updatedAt: new Date(),
      })
      .where(eq(escrowTransactions.id, escrowId));

    return escrow;
  }

  /**
   * Получить эскроу по ID
   */
  async getEscrowById(escrowId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const escrow = await db
      .select()
      .from(escrowTransactions)
      .where(eq(escrowTransactions.id, escrowId));

    return escrow[0];
  }

  /**
   * Получить все эскроу для пользователя
   */
  async getUserEscrows(userId: number, role: "client" | "executor") {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const field = role === "client" ? escrowTransactions.clientId : escrowTransactions.executorId;

    const escrows = await db
      .select()
      .from(escrowTransactions)
      .where(eq(field, userId));

    return escrows;
  }

  /**
   * Получить статистику эскроу
   */
  async getEscrowStats(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const escrows = await db
      .select()
      .from(escrowTransactions)
      .where(
        and(
          eq(escrowTransactions.clientId, userId),
          eq(escrowTransactions.status, "released")
        )
      );

    const totalAmount = escrows.reduce((sum: number, e: any) => sum + e.amount, 0);
    const count = escrows.length;
    const avgAmount = count > 0 ? totalAmount / count : 0;

    return {
      totalAmount,
      count,
      avgAmount,
      escrows,
    };
  }
}

export const escrowManager = new EscrowManager();
