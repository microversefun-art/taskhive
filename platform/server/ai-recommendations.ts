import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";

/**
 * AI Recommendations System
 * Система рекомендаций вакансий на основе AI
 */

export interface JobRecommendation {
  jobId: number;
  jobTitle: string;
  matchScore: number;
  matchPercentage: number;
  reasons: string[];
  salaryMatch: boolean;
  skillsMatch: boolean;
  experienceMatch: boolean;
}

export interface UserProfile {
  userId: number;
  skills: string[];
  experience: number;
  preferredCategories: string[];
  salaryExpectation: number;
  bio: string;
}

/**
 * Рассчитать совпадение между пользователем и вакансией
 */
export async function calculateJobMatch(
  userProfile: UserProfile,
  job: any
): Promise<JobRecommendation> {
  const reasons: string[] = [];
  let matchScore = 0;

  // Проверка категории
  const categoryMatch = userProfile.preferredCategories.some(
    (cat) => cat.toLowerCase().trim() === (job.category || "").toLowerCase().trim()
  );
  if (categoryMatch) {
    matchScore += 20;
    reasons.push("Вакансия в предпочитаемой категории");
  }

  // Проверка зарплаты
  const salaryMin = job.salaryMin || job.salary || 0;
  const salaryMax = job.salaryMax || job.salary || 0;
  const salaryMatch =
    salaryMin > 0 && salaryMax > 0 &&
    userProfile.salaryExpectation >= salaryMin &&
    userProfile.salaryExpectation <= salaryMax;

  if (salaryMatch) {
    matchScore += 25;
    reasons.push("Зарплата соответствует ожиданиям");
  } else if (salaryMin > 0) {
    reasons.push(`Зарплата: ${salaryMin}-${salaryMax} руб.`);
  }

  // Проверка опыта
  const experienceRequired = parseInt(job.requirements?.match(/\d+/)?.[0] || "0");
  const experienceMatch = userProfile.experience >= experienceRequired;

  if (experienceMatch) {
    matchScore += 25;
    reasons.push(`Ваш опыт (${userProfile.experience} лет) соответствует требованиям`);
  }

  // Проверка навыков (простой подсчет)
  const jobRequirements = job.requirements?.toLowerCase() || "";
  const skillMatches = userProfile.skills.filter((skill) =>
    jobRequirements.includes(skill.toLowerCase())
  );

  if (skillMatches.length > 0) {
    const skillMatchPercentage = (skillMatches.length / userProfile.skills.length) * 30;
    matchScore += Math.min(skillMatchPercentage, 30);
    reasons.push(`Совпадают навыки: ${skillMatches.join(", ")}`);
  }

  return {
    jobId: job.id,
    jobTitle: job.title,
    matchScore: Math.min(matchScore, 100),
    matchPercentage: Math.min(matchScore, 100),
    reasons,
    salaryMatch,
    skillsMatch: skillMatches.length > 0,
    experienceMatch,
  };
}

/**
 * Получить рекомендации вакансий для пользователя с помощью AI
 */
export async function getAIRecommendations(
  userProfile: UserProfile,
  availableJobs: any[],
  limit: number = 5
): Promise<JobRecommendation[]> {
  try {
    // Используем LLM для более умного анализа
    const prompt = `
Вы - эксперт по подбору вакансий. Проанализируйте следующий профиль пользователя и список вакансий, 
и определите лучшие совпадения на основе навыков, опыта, зарплаты и интересов.

Профиль пользователя:
- Навыки: ${userProfile.skills.join(", ")}
- Опыт: ${userProfile.experience} лет
- Предпочитаемые категории: ${userProfile.preferredCategories.join(", ")}
- Ожидаемая зарплата: ${userProfile.salaryExpectation} ₽
- О себе: ${userProfile.bio}

Доступные вакансии:
${availableJobs
  .map(
    (job, idx) =>
      `${idx + 1}. "${job.title}" (ID: ${job.id})
   Категория: ${job.category}
   Зарплата: ${job.salaryMin || job.salary}-${job.salaryMax || job.salary} ₽
   Требования: ${job.requirements}
   Описание: ${job.description}`
  )
  .join("\n\n")}

Верните JSON с массивом объектов, содержащих:
- jobId: номер вакансии
- matchScore: оценка совпадения от 0 до 100
- reasons: массив причин, почему это хорошее совпадение

Отсортируйте по matchScore в убывающем порядке.
Верните только JSON без дополнительного текста.
    `;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a job matching expert. Return only valid JSON without any markdown formatting or code blocks.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "job_recommendations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    jobId: { type: "number" },
                    matchScore: { type: "number" },
                    reasons: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["jobId", "matchScore", "reasons"],
                  additionalProperties: false,
                },
              },
            },
            required: ["recommendations"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in LLM response");
    }

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    const recommendations: JobRecommendation[] = parsed.recommendations
      .map((rec: any) => {
        const job = availableJobs.find((j) => j.id === rec.jobId);
        return {
          jobId: rec.jobId,
          jobTitle: job?.title || "Unknown",
          matchScore: rec.matchScore,
          matchPercentage: rec.matchScore,
          reasons: rec.reasons || [],
          salaryMatch: true,
          skillsMatch: true,
          experienceMatch: true,
        };
      })
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return recommendations;
  } catch (error) {
    console.error("[AI Recommendations] LLM error:", error);
    // Fallback to simple matching if LLM fails
    return getSimpleRecommendations(userProfile, availableJobs, limit);
  }
}

/**
 * Простой алгоритм рекомендаций (fallback)
 */
export async function getSimpleRecommendations(
  userProfile: UserProfile,
  availableJobs: any[],
  limit: number = 5
): Promise<JobRecommendation[]> {
  const recommendations: JobRecommendation[] = [];

  for (const job of availableJobs) {
    const match = await calculateJobMatch(userProfile, job);
    recommendations.push(match);
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

/**
 * Получить персонализированные рекомендации для пользователя
 */
export async function getPersonalizedRecommendations(
  userId: number,
  userProfile: UserProfile,
  allJobs: any[]
): Promise<JobRecommendation[]> {
  // Фильтруем уже применённые вакансии
  const applicableJobs = allJobs.filter((job) => {
    // Добавьте логику фильтрации, если необходимо
    return job.status === "active";
  });

  // Получаем рекомендации от AI
  return await getAIRecommendations(userProfile, applicableJobs, 10);
}

// tRPC Router for AI Recommendations
export const aiRecommendationsRouter = router({
  // Получить рекомендации для текущего пользователя
  getRecommendations: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      // В production получайте профиль из БД
      const userProfile: UserProfile = {
        userId: ctx.user.id,
        skills: ["JavaScript", "React", "Node.js", "Python"],
        experience: 3,
        preferredCategories: ["Разработка", "Доставка"],
        salaryExpectation: 50000,
        bio: "Опытный разработчик с интересом к стартапам",
      };

      // В production получайте вакансии из БД
      const mockJobs = [
        {
          id: 1,
          title: "Senior React Developer",
          category: "Разработка",
          salary: 80000,
          salaryMin: 70000,
          salaryMax: 100000,
          requirements: "3+ лет опыта с React, TypeScript",
          description: "Ищем опытного React разработчика",
        },
        {
          id: 2,
          title: "Курьер",
          category: "Доставка",
          salary: 30000,
          salaryMin: 25000,
          salaryMax: 35000,
          requirements: "Водительское удостоверение",
          description: "Доставка посылок по городу",
        },
      ];

      return await getAIRecommendations(userProfile, mockJobs, input.limit);
    }),

  // Получить рекомендации для конкретной вакансии
  getSimilarJobs: protectedProcedure
    .input(
      z.object({
        jobId: z.number(),
        limit: z.number().default(5),
      })
    )
    .query(async ({ input }) => {
      // В production получайте вакансию и похожие вакансии из БД
      return {
        jobId: input.jobId,
        similarJobs: [
          {
            id: 2,
            title: "Similar Job 1",
            matchScore: 85,
            category: "Разработка",
          },
          {
            id: 3,
            title: "Similar Job 2",
            matchScore: 78,
            category: "Разработка",
          },
        ],
      };
    }),

  // Получить объяснение рекомендации
  getRecommendationExplanation: protectedProcedure
    .input(
      z.object({
        jobId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return {
        jobId: input.jobId,
        explanation:
          "Эта вакансия рекомендована, потому что она соответствует вашим навыкам и опыту",
        matchFactors: [
          "Совпадают навыки: React, JavaScript",
          "Опыт соответствует требованиям",
          "Зарплата в ожидаемом диапазоне",
          "Категория в ваших предпочтениях",
        ],
      };
    }),

  // Обновить профиль для улучшения рекомендаций
  updateProfile: protectedProcedure
    .input(
      z.object({
        skills: z.array(z.string()).optional(),
        experience: z.number().optional(),
        preferredCategories: z.array(z.string()).optional(),
        salaryExpectation: z.number().optional(),
        bio: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // В production сохраняйте в БД
      return {
        success: true,
        message: "Профиль обновлен",
        userId: ctx.user.id,
        updatedFields: Object.keys(input).filter((key) => input[key as keyof typeof input] !== undefined),
      };
    }),
});
