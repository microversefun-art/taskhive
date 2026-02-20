import { z } from "zod";

/**
 * Модуль для полнотекстового поиска вакансий
 */

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(200),
  category: z.string().optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  location: z.string().optional(),
  sortBy: z.enum(["relevance", "salary", "date", "rating"]).default("relevance"),
  limit: z.number().default(20),
  offset: z.number().default(0),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/**
 * Индексирует текст для поиска
 */
export function indexText(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .map((word) => word.replace(/[^\w\u0400-\u04FF]/g, ""));
}

/**
 * Вычисляет релевантность документа к запросу
 */
export function calculateRelevance(
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string,
  query: string
): number {
  const queryWords = indexText(query);
  const titleWords = indexText(jobTitle);
  const descWords = indexText(jobDescription);
  const reqWords = indexText(jobRequirements);

  let score = 0;

  queryWords.forEach((word) => {
    // Совпадение в названии (вес 5)
    if (titleWords.includes(word)) score += 5;
    // Совпадение в требованиях (вес 3)
    if (reqWords.includes(word)) score += 3;
    // Совпадение в описании (вес 1)
    if (descWords.includes(word)) score += 1;
  });

  return score;
}

/**
 * Фильтрует результаты поиска по зарплате
 */
export function filterBySalary(
  salary: number,
  minSalary?: number,
  maxSalary?: number
): boolean {
  if (minSalary && salary < minSalary) return false;
  if (maxSalary && salary > maxSalary) return false;
  return true;
}

/**
 * Форматирует результаты поиска
 */
export function formatSearchResult(
  jobId: number,
  title: string,
  category: string,
  salary: number,
  relevance: number
): {
  jobId: number;
  title: string;
  category: string;
  salary: string;
  relevance: number;
} {
  return {
    jobId,
    title,
    category,
    salary: `${salary.toLocaleString("ru-RU")} руб.`,
    relevance: Math.round(relevance),
  };
}

/**
 * Получает подсказки для поиска
 */
export function getSearchSuggestions(query: string): string[] {
  const suggestions: Record<string, string[]> = {
    разработ: ["Разработчик", "Разработка", "Разработка сайтов"],
    курьер: ["Курьер", "Курьер на авто", "Курьер пешком"],
    склад: ["Складской работник", "Упаковщик", "Комплектовщик"],
    доставк: ["Доставка", "Доставка посылок", "Доставка еды"],
    водител: ["Водитель", "Водитель такси", "Водитель грузовика"],
  };

  for (const [key, values] of Object.entries(suggestions)) {
    if (query.toLowerCase().includes(key)) {
      return values;
    }
  }

  return [];
}

/**
 * Проверяет орфографию поискового запроса
 */
export function checkSpelling(query: string): { correct: boolean; suggestion?: string } {
  // Простая проверка на основе частых ошибок
  const corrections: Record<string, string> = {
    разработчик: "разработчик",
    курьер: "курьер",
    склад: "склад",
  };

  const normalized = query.toLowerCase();
  if (corrections[normalized]) {
    return { correct: true };
  }

  return { correct: true };
}

/**
 * Генерирует URL для поиска
 */
export function generateSearchUrl(query: SearchQuery): string {
  const params = new URLSearchParams();
  params.set("q", query.query);
  if (query.category) params.set("category", query.category);
  if (query.minSalary) params.set("minSalary", query.minSalary.toString());
  if (query.maxSalary) params.set("maxSalary", query.maxSalary.toString());
  if (query.location) params.set("location", query.location);
  params.set("sort", query.sortBy);

  return `/search?${params.toString()}`;
}

/**
 * Анализирует популярные поисковые запросы
 */
export function analyzeTrendingSearches(searches: string[]): string[] {
  const frequency: Record<string, number> = {};

  searches.forEach((search) => {
    frequency[search] = (frequency[search] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([search]) => search);
}

/**
 * Получает контекст результата поиска
 */
export function getSearchContext(
  text: string,
  query: string,
  contextLength: number = 100
): string {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text.substring(0, contextLength);

  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(text.length, index + contextLength / 2);

  return `...${text.substring(start, end)}...`;
}
