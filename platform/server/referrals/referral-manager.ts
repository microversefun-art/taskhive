import { getDb } from "../db";
import {
  referrals,
  referralBonuses,
  referralPayouts,
  referralStats,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

/**
 * Реферальный менеджер - управление рефералами и бонусами
 */
export class ReferralManager {
  /**
   * Генерировать уникальный реферальный код
   */
  static generateReferralCode(): string {
    return crypto.randomBytes(16).toString("hex").substring(0, 12).toUpperCase();
  }

  /**
   * Создать реферальную ссылку для пользователя
   */
  static async createReferralLink(referrerId: number): Promise<string> {
    const code = this.generateReferralCode();
    const database = await getDb();

    if (!database) throw new Error("Database not available");

    // Проверить, есть ли уже реферальная ссылка
    const existing = await database
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, referrerId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].referralCode;
    }

    // Создать новую реферальную ссылку
    await database.insert(referrals).values({
      referrerId,
      referredId: 0,
      referralCode: code,
      status: "pending",
      bonusPercentage: 10,
    });

    return code;
  }

  /**
   * Активировать реферала по коду
   */
  static async activateReferral(referralCode: string, referredId: number): Promise<boolean> {
    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Найти реферальную ссылку
      const referralLink = await database
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, referralCode))
        .limit(1);

      if (!referralLink || referralLink.length === 0) {
        throw new Error("Реферальный код не найден");
      }

      const referral = referralLink[0];

      // Проверить, не активирован ли уже
      if (referral.status === "active") {
        throw new Error("Реферальный код уже активирован");
      }

      // Обновить реферала
      await database
        .update(referrals)
        .set({
          referredId,
          status: "active",
          activatedAt: new Date(),
        })
        .where(eq(referrals.id, referral.id));

      // Создать или обновить статистику
      await this.updateReferralStats(referral.referrerId);

      return true;
    } catch (error) {
      console.error("Error activating referral:", error);
      return false;
    }
  }

  /**
   * Начислить бонус за заказ
   */
  static async awardBonus(
    referralId: number,
    orderId: number,
    commissionAmount: number,
    bonusPercentage: number = 10
  ): Promise<boolean> {
    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const referral = await database
        .select()
        .from(referrals)
        .where(eq(referrals.id, referralId))
        .limit(1);

      if (!referral || referral.length === 0) {
        throw new Error("Реферал не найден");
      }

      const ref = referral[0];

      // Рассчитать бонус
      const bonusAmount = Math.floor((commissionAmount * bonusPercentage) / 100);

      // Создать запись о бонусе
      await database.insert(referralBonuses).values({
        referralId: ref.id,
        referrerId: ref.referrerId,
        referredId: ref.referredId,
        orderId,
        commissionAmount,
        bonusAmount,
        bonusPercentage,
        status: "pending",
      });

      // Обновить статистику реферала
      await database
        .update(referrals)
        .set({
          totalEarned: ref.totalEarned + bonusAmount,
          totalCommission: ref.totalCommission + commissionAmount,
        })
        .where(eq(referrals.id, ref.id));

      // Обновить статистику
      await this.updateReferralStats(ref.referrerId);

      return true;
    } catch (error) {
      console.error("Error awarding bonus:", error);
      return false;
    }
  }

  /**
   * Получить бонусы реферера
   */
  static async getReferrerBonuses(referrerId: number) {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const bonuses = await database
      .select()
      .from(referralBonuses)
      .where(eq(referralBonuses.referrerId, referrerId));

    return {
      total: bonuses.length,
      pending: bonuses.filter((b: any) => b.status === "pending").length,
      paid: bonuses.filter((b: any) => b.status === "paid").length,
      totalAmount: bonuses.reduce((sum: number, b: any) => sum + b.bonusAmount, 0),
      pendingAmount: bonuses
        .filter((b: any) => b.status === "pending")
        .reduce((sum: number, b: any) => sum + b.bonusAmount, 0),
      paidAmount: bonuses
        .filter((b: any) => b.status === "paid")
        .reduce((sum: number, b: any) => sum + b.bonusAmount, 0),
      bonuses,
    };
  }

  /**
   * Получить список рефералов пользователя
   */
  static async getUserReferrals(referrerId: number) {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const userReferrals = await database
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, referrerId));

    return userReferrals;
  }

  /**
   * Обновить статистику реферала
   */
  static async updateReferralStats(referrerId: number): Promise<void> {
    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Получить все рефералы
      const allReferrals = await database
        .select()
        .from(referrals)
        .where(eq(referrals.referrerId, referrerId));

      const activeReferrals = allReferrals.filter((r: any) => r.status === "active");

      // Получить все бонусы
      const allBonuses = await database
        .select()
        .from(referralBonuses)
        .where(eq(referralBonuses.referrerId, referrerId));

      const totalBonusEarned = allBonuses.reduce((sum: number, b: any) => sum + b.bonusAmount, 0);
      const totalBonusPaid = allBonuses
        .filter((b: any) => b.status === "paid")
        .reduce((sum: number, b: any) => sum + b.bonusAmount, 0);
      const totalBonusPending = allBonuses
        .filter((b: any) => b.status === "pending")
        .reduce((sum: number, b: any) => sum + b.bonusAmount, 0);

      const averageBonusPerReferral =
        activeReferrals.length > 0
          ? Math.floor(totalBonusEarned / activeReferrals.length)
          : 0;

      // Обновить или создать статистику
      const existing = await database
        .select()
        .from(referralStats)
        .where(eq(referralStats.referrerId, referrerId))
        .limit(1);

      if (existing.length > 0) {
        await database
          .update(referralStats)
          .set({
            totalReferrals: allReferrals.length,
            activeReferrals: activeReferrals.length,
            totalBonusEarned,
            totalBonusPaid,
            totalBonusPending,
            averageBonusPerReferral,
          })
          .where(eq(referralStats.referrerId, referrerId));
      } else {
        await database.insert(referralStats).values({
          referrerId,
          totalReferrals: allReferrals.length,
          activeReferrals: activeReferrals.length,
          totalBonusEarned,
          totalBonusPaid,
          totalBonusPending,
          averageBonusPerReferral,
        });
      }
    } catch (error) {
      console.error("Error updating referral stats:", error);
    }
  }

  /**
   * Получить статистику реферера
   */
  static async getReferralStats(referrerId: number): Promise<any> {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const stats = await database
      .select()
      .from(referralStats)
      .where(eq(referralStats.referrerId, referrerId))
      .limit(1);

    if (stats.length === 0) {
      // Создать пустую статистику
      await this.updateReferralStats(referrerId);
      return await this.getReferralStats(referrerId);
    }

    return stats[0];
  }

  /**
   * Создать выплату бонусов
   */
  static async createPayout(
    referrerId: number,
    paymentMethod: string = "robokassa"
  ): Promise<number | null> {
    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Получить все неоплаченные бонусы
      const pendingBonuses = await database
        .select()
        .from(referralBonuses)
        .where(
          and(
            eq(referralBonuses.referrerId, referrerId),
            eq(referralBonuses.status, "pending")
          )
        );

      if (pendingBonuses.length === 0) {
        throw new Error("Нет неоплаченных бонусов");
      }

      // Рассчитать общую сумму
      const totalAmount = pendingBonuses.reduce((sum: number, b: any) => sum + b.bonusAmount, 0);

      // Создать выплату
      const result = await database.insert(referralPayouts).values({
        referrerId,
        totalAmount,
        bonusCount: pendingBonuses.length,
        status: "pending",
        paymentMethod,
      });

      return result[0].insertId;
    } catch (error) {
      console.error("Error creating payout:", error);
      return null;
    }
  }

  /**
   * Обновить статус выплаты
   */
  static async updatePayoutStatus(
    payoutId: number,
    status: "processing" | "completed" | "failed",
    transactionId?: string,
    failureReason?: string
  ): Promise<boolean> {
    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const updates: any = {
        status,
        processedAt: new Date(),
      };

      if (transactionId) {
        updates.transactionId = transactionId;
      }

      if (failureReason) {
        updates.failureReason = failureReason;
      }

      await database
        .update(referralPayouts)
        .set(updates)
        .where(eq(referralPayouts.id, payoutId));

      // Если выплата завершена, обновить статус бонусов
      if (status === "completed") {
        const payout = await database
          .select()
          .from(referralPayouts)
          .where(eq(referralPayouts.id, payoutId))
          .limit(1);

        if (payout.length > 0) {
          const pendingBonuses = await database
            .select()
            .from(referralBonuses)
            .where(
              and(
                eq(referralBonuses.referrerId, payout[0].referrerId),
                eq(referralBonuses.status, "pending")
              )
            );

          // Обновить статус первых N бонусов (количество из выплаты)
          for (let i = 0; i < payout[0].bonusCount && i < pendingBonuses.length; i++) {
            await database
              .update(referralBonuses)
              .set({
                status: "paid",
                paidAt: new Date(),
              })
              .where(eq(referralBonuses.id, pendingBonuses[i].id));
          }

          // Обновить статистику
          await this.updateReferralStats(payout[0].referrerId);
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating payout status:", error);
      return false;
    }
  }

  /**
   * Получить историю выплат
   */
  static async getPayoutHistory(referrerId: number) {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const payouts = await database
      .select()
      .from(referralPayouts)
      .where(eq(referralPayouts.referrerId, referrerId));

    return payouts;
  }
}
