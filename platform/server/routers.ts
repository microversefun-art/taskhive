import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { paymentRouter } from "./payment";
import { messengerRouter } from "./messenger";
import { notificationRouter } from "./notifications";
import { aiRecommendationsRouter } from "./ai-recommendations";
import { videoInterviewRouter, ratingsRouter } from "./video-ratings-routers";
import { achievementsRouter, recommendationsRouter, recurringOrdersRouter } from "./gamification-routers";
import {
  getAllBusinessBoxes,
  getUserBoxes,
  getUserSelfEmploymentStatus,
  startBusinessBox,
  completeBoxTask,
  getRecommendedBoxes,
} from "./business-boxes";
import {
  getUrgentTasks,
  getUserTasks,
  acceptTask,
  completeTask,
  rejectTask,
  getPopularTaskCategories,
} from "./task-system";
import {
  createJob,
  getJobById,
  getActiveJobs,
  getJobsByCategory,
  getHotJobs,
  createApplication,
  getApplicationsByWorker,
  getApplicationsByJob,
  createUserProfile,
  getUserProfile,
  createOrUpdateScoring,
  getScoringByUserId,
  createChat,
  getChatsByUserId,
  createMessage,
  getMessagesByChatId,
  createNotification,
  getNotificationsByUserId,
  getActivePartners,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  payment: paymentRouter,
  messenger: messengerRouter,
  notifications: notificationRouter,
  aiRecommendations: aiRecommendationsRouter,
  videoInterview: videoInterviewRouter,
  ratings: ratingsRouter,
  achievements: achievementsRouter,
  recommendations: recommendationsRouter,
  recurringOrders: recurringOrdersRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= Jobs Router =============
  jobs: router({
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await getActiveJobs(input.limit, input.offset);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getJobById(input.id);
      }),

    byCategory: publicProcedure
      .input(
        z.object({
          category: z.string(),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await getJobsByCategory(input.category, input.limit, input.offset);
      }),

    hotJobs: publicProcedure.query(async () => {
      return await getHotJobs(5);
    }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          category: z.string(),
          salary: z.number().optional(),
          salaryMin: z.number().optional(),
          salaryMax: z.number().optional(),
          location: z.string(),
          region: z.string(),
          requirements: z.string().optional(),
          duration: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createJob({
          employerId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // ============= Applications Router =============
  applications: router({
    submit: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await createApplication({
          jobId: input.jobId,
          workerId: ctx.user.id,
          status: "pending",
        });
      }),

    getByWorker: protectedProcedure.query(async ({ ctx }) => {
      return await getApplicationsByWorker(ctx.user.id);
    }),

    getByJob: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        return await getApplicationsByJob(input.jobId);
      }),
  }),

  // ============= User Profile Router =============
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getUserProfile(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          userType: z.enum(["worker", "employer"]),
          bio: z.string().optional(),
          phone: z.string().optional(),
          skills: z.string().optional(),
          experience: z.number().optional(),
          companyName: z.string().optional(),
          companyDescription: z.string().optional(),
          website: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createUserProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // ============= Scoring Router =============
  scoring: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getScoringByUserId(ctx.user.id);
    }),

    calculate: protectedProcedure
      .input(
        z.object({
          iqScore: z.number().optional(),
          professionalScore: z.number().optional(),
          reliabilityScore: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const iq = input.iqScore || 100;
        const prof = input.professionalScore || 50;
        const rel = input.reliabilityScore || 50;

        // Расчет итогового скора
        const overall = Math.round((iq / 2 + prof + rel) / 3);
        const scoreLevel =
          overall >= 80 ? "excellent" : overall >= 60 ? "high" : overall >= 40 ? "medium" : "low";

        return await createOrUpdateScoring({
          userId: ctx.user.id,
          iqScore: iq,
          professionalScore: prof,
          reliabilityScore: rel,
          overallScore: overall,
          scoreLevel: scoreLevel as any,
        });
      }),
  }),

  // ============= Chat Router =============
  chats: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getChatsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({ participantId: z.number(), jobId: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        return await createChat({
          participantOne: ctx.user.id,
          participantTwo: input.participantId,
          jobId: input.jobId,
        });
      }),

    sendMessage: protectedProcedure
      .input(z.object({ chatId: z.number(), content: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return await createMessage({
          chatId: input.chatId,
          senderId: ctx.user.id,
          content: input.content,
        });
      }),

    getMessages: protectedProcedure
      .input(z.object({ chatId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await getMessagesByChatId(input.chatId, input.limit);
      }),
  }),



  // ============= Partners Router =============
  partners: router({
    list: publicProcedure.query(async () => {
      return await getActivePartners();
    }),
  }),

  // ============= Business Boxes Router =============
  boxes: router({
    getAll: publicProcedure.query(async () => {
      return await getAllBusinessBoxes();
    }),

    getRecommended: protectedProcedure.query(async ({ ctx }) => {
      return await getRecommendedBoxes(ctx.user.id);
    }),

    getUserBoxes: protectedProcedure.query(async ({ ctx }) => {
      return await getUserBoxes(ctx.user.id);
    }),

    getSelfEmploymentStatus: protectedProcedure.query(async ({ ctx }) => {
      return await getUserSelfEmploymentStatus(ctx.user.id);
    }),

    start: protectedProcedure
      .input(z.object({ boxId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return await startBusinessBox(ctx.user.id, input.boxId);
      }),

    completeTask: protectedProcedure
      .input(
        z.object({
          boxId: z.string(),
          taskId: z.string(),
          reward: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await completeBoxTask(ctx.user.id, input.boxId, input.taskId, input.reward);
      }),
  }),

  // ============= Tasks Router =============
  tasks: router({
    getUrgent: publicProcedure
      .input(
        z.object({
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          radius: z.number().default(5000),
        })
      )
      .query(async ({ input }) => {
        return await getUrgentTasks(input.latitude, input.longitude, input.radius);
      }),

    getUserTasks: protectedProcedure.query(async ({ ctx }) => {
      return await getUserTasks(ctx.user.id);
    }),

    getPopularCategories: publicProcedure.query(async () => {
      return await getPopularTaskCategories();
    }),

    accept: protectedProcedure
      .input(z.object({ taskId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return await acceptTask(ctx.user.id, input.taskId);
      }),

    complete: protectedProcedure
      .input(
        z.object({
          taskId: z.string(),
          proof: z
            .object({
              type: z.enum(["photo", "video", "text", "screenshot"]),
              url: z.string(),
            })
            .optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await completeTask(ctx.user.id, input.taskId, input.proof);
      }),

    reject: protectedProcedure
      .input(
        z.object({
          taskId: z.string(),
          reason: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await rejectTask(ctx.user.id, input.taskId, input.reason);
      }),
  }),
});

export type AppRouter = typeof appRouter;
