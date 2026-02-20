import { z } from 'zod';
import { invokeLLM } from '../_core/llm';

/**
 * AI Matching Engine
 * Автоматический подбор исполнителей на основе AI анализа
 */

export const TaskMatchingSchema = z.object({
  taskId: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  budget: z.number(),
  deadline: z.date(),
  requiredSkills: z.array(z.string()),
  complexity: z.enum(['easy', 'medium', 'hard']),
});

export const ExecutorProfileSchema = z.object({
  executorId: z.string(),
  name: z.string(),
  skills: z.array(z.string()),
  rating: z.number(),
  completedTasks: z.number(),
  responseTime: z.number(), // в часах
  successRate: z.number(), // 0-100
  hourlyRate: z.number(),
  categories: z.array(z.string()),
  isVerified: z.boolean(),
  reputationScore: z.number(),
});

export class AIMatchingEngine {
  /**
   * Найти лучших исполнителей для задачи
   */
  static async findBestMatches(
    task: z.infer<typeof TaskMatchingSchema>,
    availableExecutors: z.infer<typeof ExecutorProfileSchema>[]
  ): Promise<Array<{
    executorId: string;
    matchScore: number;
    reasoning: string;
    estimatedPrice: number;
    estimatedDuration: number;
  }>> {
    const prompt = `
Ты - эксперт по подбору исполнителей для задач.

ЗАДАЧА:
- Название: ${task.title}
- Описание: ${task.description}
- Категория: ${task.category}
- Бюджет: ${task.budget}₽
- Дедлайн: ${task.deadline.toISOString()}
- Требуемые навыки: ${task.requiredSkills.join(', ')}
- Сложность: ${task.complexity}

ДОСТУПНЫЕ ИСПОЛНИТЕЛИ:
${availableExecutors.map(e => `
- ${e.name} (ID: ${e.executorId})
  - Навыки: ${e.skills.join(', ')}
  - Рейтинг: ${e.rating}/5 (${e.completedTasks} задач)
  - Успешность: ${e.successRate}%
  - Время ответа: ${e.responseTime}ч
  - Почасовая ставка: ${e.hourlyRate}₽
  - Репутация: ${e.reputationScore}
`).join('\n')}

Проанализируй каждого исполнителя и верни JSON с массивом:
[
  {
    "executorId": "id",
    "matchScore": 0-100,
    "reasoning": "почему подходит",
    "estimatedPrice": число,
    "estimatedDuration": число (в часах)
  }
]

Сортируй по matchScore в убывающем порядке. Верни только JSON.
`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'Ты - эксперт по подбору исполнителей. Отвечай только валидным JSON.',
          },
          { role: 'user', content: prompt },
        ],
      });

      const content = response.choices[0]?.message?.content || '[]';
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      const matches = JSON.parse(contentStr);
      return matches.sort((a: any, b: any) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error('Matching error:', error);
      return [];
    }
  }

  /**
   * Рассчитать оптимальную цену для задачи
   */
  static async calculateOptimalPrice(
    task: z.infer<typeof TaskMatchingSchema>,
    matches: Array<{ executorId: string; estimatedPrice: number }>
  ): Promise<{
    recommendedPrice: number;
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
  }> {
    if (matches.length === 0) {
      return {
        recommendedPrice: task.budget,
        minPrice: task.budget * 0.7,
        maxPrice: task.budget * 1.3,
        averagePrice: task.budget,
      };
    }

    const prices = matches.map(m => m.estimatedPrice);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      recommendedPrice: Math.round(avgPrice),
      minPrice: Math.round(minPrice),
      maxPrice: Math.round(maxPrice),
      averagePrice: Math.round(avgPrice),
    };
  }

  /**
   * Предсказать вероятность успеха выполнения
   */
  static async predictSuccessProbability(
    executor: z.infer<typeof ExecutorProfileSchema>,
    task: z.infer<typeof TaskMatchingSchema>
  ): Promise<{
    probability: number; // 0-100
    factors: Array<{ factor: string; impact: number }>;
  }> {
    const skillMatch = this.calculateSkillMatch(executor.skills, task.requiredSkills);
    const ratingFactor = (executor.rating / 5) * 100;
    const successRateFactor = executor.successRate;
    const reputationFactor = Math.min(executor.reputationScore, 100);

    const probability = Math.round(
      (skillMatch * 0.4 + ratingFactor * 0.2 + successRateFactor * 0.2 + reputationFactor * 0.2)
    );

    return {
      probability: Math.min(probability, 100),
      factors: [
        { factor: 'Совпадение навыков', impact: skillMatch },
        { factor: 'Рейтинг', impact: ratingFactor },
        { factor: 'Успешность', impact: successRateFactor },
        { factor: 'Репутация', impact: reputationFactor },
      ],
    };
  }

  /**
   * Рассчитать совпадение навыков
   */
  private static calculateSkillMatch(executorSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 100;

    const matchedSkills = requiredSkills.filter(skill =>
      executorSkills.some(es => es.toLowerCase().includes(skill.toLowerCase()))
    );

    return Math.round((matchedSkills.length / requiredSkills.length) * 100);
  }

  /**
   * Автоматически отправить предложение лучшим исполнителям
   */
  static async autoSendOffers(
    task: z.infer<typeof TaskMatchingSchema>,
    matches: Array<{ executorId: string; matchScore: number }>,
    maxOffers = 5
  ): Promise<Array<{ executorId: string; offerSent: boolean }>> {
    const topMatches = matches.slice(0, maxOffers);
    
    return topMatches.map(match => ({
      executorId: match.executorId,
      offerSent: true, // TODO: Отправить предложение через систему уведомлений
    }));
  }
}

// tRPC процедуры для matching engine
export const matchingProcedures = {
  findMatches: async (task: z.infer<typeof TaskMatchingSchema>, executors: z.infer<typeof ExecutorProfileSchema>[]) => {
    return AIMatchingEngine.findBestMatches(task, executors);
  },

  calculatePrice: async (
    task: z.infer<typeof TaskMatchingSchema>,
    matches: Array<{ executorId: string; estimatedPrice: number }>
  ) => {
    return AIMatchingEngine.calculateOptimalPrice(task, matches);
  },

  predictSuccess: async (
    executor: z.infer<typeof ExecutorProfileSchema>,
    task: z.infer<typeof TaskMatchingSchema>
  ) => {
    return AIMatchingEngine.predictSuccessProbability(executor, task);
  },

  autoSendOffers: async (
    task: z.infer<typeof TaskMatchingSchema>,
    matches: Array<{ executorId: string; matchScore: number }>
  ) => {
    return AIMatchingEngine.autoSendOffers(task, matches);
  },
};
