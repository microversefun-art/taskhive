import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const videoInterviewRouter = router({
  schedule: protectedProcedure
    .input(
      z.object({
        jobId: z.number(),
        workerId: z.number(),
        scheduledAt: z.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        message: "Видеоинтервью успешно запланировано",
        interviewId: Math.floor(Math.random() * 1000),
      };
    }),

  get: publicProcedure
    .input(z.object({ interviewId: z.number() }))
    .query(async ({ input }) => {
      return {
        id: input.interviewId,
        status: "scheduled",
        scheduledAt: new Date(),
      };
    }),
});

export const ratingsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        jobId: z.number(),
        targetId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string(),
        comment: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        message: "Отзыв успешно добавлен",
        ratingId: Math.floor(Math.random() * 1000),
      };
    }),

  getByUser: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return {
        averageRating: 4.5,
        totalRatings: 12,
        ratings: [],
      };
    }),

  getByJob: publicProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ input }) => {
      return {
        averageRating: 4.3,
        totalRatings: 8,
        ratings: [],
      };
    }),
});
