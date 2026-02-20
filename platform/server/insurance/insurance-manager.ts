import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { insurancePlans, insuranceClaims } from "../../drizzle/schema";

export class InsuranceManager {
  /**
   * Создать план страховки
   */
  async createPlan(
    userId: number,
    planType: "executor_protection" | "client_protection" | "both",
    monthlyPrice: number,
    coverageAmount: number
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const plan = await db.insert(insurancePlans).values({
      userId,
      planType,
      monthlyPrice,
      coverageAmount,
      status: "active",
    });

    return plan;
  }

  /**
   * Получить план по ID
   */
  async getPlanById(planId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const plan = await db
      .select()
      .from(insurancePlans)
      .where(eq(insurancePlans.id, planId));

    return plan[0];
  }

  /**
   * Получить активные планы пользователя
   */
  async getUserActivePlans(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const plans = await db
      .select()
      .from(insurancePlans)
      .where(eq(insurancePlans.userId, userId));

    return plans.filter(
      (p: any) =>
        p.status === "active" &&
        (!p.endDate || new Date(p.endDate) > new Date())
    );
  }

  /**
   * Отменить план
   */
  async cancelPlan(planId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const plan = await db
      .update(insurancePlans)
      .set({
        status: "inactive",
        endDate: new Date(),
      })
      .where(eq(insurancePlans.id, planId));

    return plan;
  }

  /**
   * Создать страховую претензию
   */
  async createClaim(
    insurancePlanId: number,
    jobId: number,
    claimReason: string,
    claimAmount: number,
    evidence?: string
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const claim = await db.insert(insuranceClaims).values({
      insurancePlanId,
      jobId,
      claimReason,
      claimAmount,
      evidence,
      status: "pending",
    });

    return claim;
  }

  /**
   * Получить претензию по ID
   */
  async getClaimById(claimId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const claim = await db
      .select()
      .from(insuranceClaims)
      .where(eq(insuranceClaims.id, claimId));

    return claim[0];
  }

  /**
   * Одобрить претензию
   */
  async approveClaim(claimId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const claim = await db
      .update(insuranceClaims)
      .set({
        status: "approved",
        approvalDate: new Date(),
      })
      .where(eq(insuranceClaims.id, claimId));

    return claim;
  }

  /**
   * Отклонить претензию
   */
  async rejectClaim(claimId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const claim = await db
      .update(insuranceClaims)
      .set({
        status: "rejected",
      })
      .where(eq(insuranceClaims.id, claimId));

    return claim;
  }

  /**
   * Выплатить по претензии
   */
  async payClaim(claimId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const claim = await db
      .update(insuranceClaims)
      .set({
        status: "paid",
        paymentDate: new Date(),
      })
      .where(eq(insuranceClaims.id, claimId));

    return claim;
  }

  /**
   * Получить претензии пользователя
   */
  async getUserClaims(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const plans = await db
      .select()
      .from(insurancePlans)
      .where(eq(insurancePlans.userId, userId));

    const planIds = plans.map((p: any) => p.id);

    if (planIds.length === 0) return [];

    // Get all claims for these plans
    const allClaims = await db
      .select()
      .from(insuranceClaims);

    return allClaims.filter((c: any) =>
      planIds.includes(c.insurancePlanId)
    );
  }

  /**
   * Получить статистику страховки
   */
  async getInsuranceStats(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const plans = await db
      .select()
      .from(insurancePlans)
      .where(eq(insurancePlans.userId, userId));

    const activePlans = plans.filter(
      (p: any) =>
        p.status === "active" &&
        (!p.endDate || new Date(p.endDate) > new Date())
    );

    const totalMonthlyPrice = activePlans.reduce(
      (sum: number, p: any) => sum + p.monthlyPrice,
      0
    );

    const totalCoverageAmount = activePlans.reduce(
      (sum: number, p: any) => sum + p.coverageAmount,
      0
    );

    return {
      activePlans: activePlans.length,
      totalMonthlyPrice,
      totalCoverageAmount,
      plans,
    };
  }
}

export const insuranceManager = new InsuranceManager();
