import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { AchievementsManager } from "./gamification/achievements-manager";
import { RecommendationsEngine } from "./gamification/recommendations-engine";
import { RecurringOrdersManager } from "./gamification/recurring-orders-manager";

export const achievementsRouter = router({
  getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
    return await AchievementsManager.getUserAchievements(ctx.user.id);
  }),

  getLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return await AchievementsManager.getLeaderboardByLevel(input.limit);
    }),

  getUserLevel: protectedProcedure.query(async ({ ctx }) => {
    return await AchievementsManager.getUserLevel(ctx.user.id);
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    return await AchievementsManager.getAchievementStats(ctx.user.id);
  }),
});

export const recommendationsRouter = router({
  getForExecutor: protectedProcedure.query(async ({ ctx }) => {
    return await RecommendationsEngine.generateExecutorRecommendations(ctx.user.id);
  }),

  getForClient: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await RecommendationsEngine.generateClientRecommendations(ctx.user.id, input.jobId);
    }),

  markClicked: protectedProcedure
    .input(z.object({ recommendationId: z.number() }))
    .mutation(async ({ input }) => {
      return await RecommendationsEngine.markAsClicked(input.recommendationId);
    }),

  markApplied: protectedProcedure
    .input(z.object({ recommendationId: z.number() }))
    .mutation(async ({ input }) => {
      return await RecommendationsEngine.markAsApplied(input.recommendationId);
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    return await RecommendationsEngine.getStats(ctx.user.id);
  }),
});

export const recurringOrdersRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        executorId: z.number(),
        jobId: z.number(),
        frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
        discount: z.number().default(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await RecurringOrdersManager.createRecurringOrder(
        ctx.user.id,
        input.executorId,
        input.jobId,
        input.frequency,
        input.discount
      );
    }),

  getUserOrders: protectedProcedure
    .input(z.object({ type: z.enum(["client", "executor"]) }))
    .query(async ({ input, ctx }) => {
      return await RecurringOrdersManager.getUserRecurringOrders(ctx.user.id, input.type);
    }),

  getHistory: protectedProcedure
    .input(z.object({ recurringOrderId: z.number() }))
    .query(async ({ input }) => {
      return await RecurringOrdersManager.getRecurringOrderHistory(input.recurringOrderId);
    }),

  getStats: protectedProcedure
    .input(z.object({ recurringOrderId: z.number() }))
    .query(async ({ input }) => {
      return await RecurringOrdersManager.getStats(input.recurringOrderId);
    }),

  pause: protectedProcedure
    .input(z.object({ recurringOrderId: z.number() }))
    .mutation(async ({ input }) => {
      return await RecurringOrdersManager.pauseRecurringOrder(input.recurringOrderId);
    }),

  resume: protectedProcedure
    .input(z.object({ recurringOrderId: z.number() }))
    .mutation(async ({ input }) => {
      return await RecurringOrdersManager.resumeRecurringOrder(input.recurringOrderId);
    }),

  cancel: protectedProcedure
    .input(z.object({ recurringOrderId: z.number(), reason: z.string() }))
    .mutation(async ({ input }) => {
      return await RecurringOrdersManager.cancelRecurringOrder(input.recurringOrderId, input.reason);
    }),
});
