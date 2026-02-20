/**
 * AI Moderation System
 * Поддержка российских LLM: Yandex.GPT, GigaChat (Sber), DeepSeek, HuggingFace
 */

import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================

export type LLMProvider = "yandex_gpt" | "gigachat" | "deepseek" | "huggingface" | "openai";

export interface ModerationConfig {
  provider: LLMProvider;
  apiKey: string;
  apiUrl?: string;
  model?: string;
  timeout?: number;
}

export interface ModerationRequest {
  text: string;
  type: "task_description" | "task_title" | "review" | "comment" | "profile_bio";
  userId?: string;
  contextId?: string;
}

export interface ModerationResult {
  isApproved: boolean;
  score: number; // 0-1, где 1 - полностью одобрено
  violations: string[];
  reason?: string;
  provider: LLMProvider;
  processingTime: number;
}

// ============================================================================
// YANDEX.GPT
// ============================================================================

export class YandexGPTModerator {
  private apiKey: string;
  private apiUrl = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
  private model = "yandexgpt-3";

  constructor(config: ModerationConfig) {
    if (!config.apiKey) {
      throw new Error("Yandex.GPT requires apiKey");
    }
    this.apiKey = config.apiKey;
    if (config.model) this.model = config.model;
  }

  async moderate(request: ModerationRequest): Promise<ModerationResult> {
    const startTime = Date.now();

    const prompt = this.buildPrompt(request);

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Api-Key ${this.apiKey}`,
        },
        body: JSON.stringify({
          modelUri: `gpt://${this.getProjectId()}/${this.model}`,
          completionOptions: {
            stream: false,
            temperature: 0.1,
            maxTokens: 500,
          },
          messages: [
            {
              role: "system",
              text: "Ты модератор контента для платформы TaskHive. Твоя задача - проверить текст на соответствие правилам и выдать оценку.",
            },
            {
              role: "user",
              text: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Yandex.GPT error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const result = this.parseResponse(data.result.alternatives[0].message.text);

      return {
        ...result,
        provider: "yandex_gpt",
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error("Yandex.GPT moderation error:", error);
      throw error;
    }
  }

  private buildPrompt(request: ModerationRequest): string {
    return `Проверь следующий текст на соответствие правилам платформы:

Тип контента: ${request.type}
Текст: "${request.text}"

Проверь наличие:
1. Оскорблений и ненависти
2. Спама и рекламы
3. Насилия и угроз
4. Незаконного контента
5. Персональных данных
6. Контактной информации (телефоны, email)

Ответь в формате JSON:
{
  "approved": boolean,
  "score": number (0-1),
  "violations": [список нарушений],
  "reason": "краткое объяснение"
}`;
  }

  private parseResponse(text: string): Omit<ModerationResult, "provider" | "processingTime"> {
    try {
      const json = JSON.parse(text);
      return {
        isApproved: json.approved,
        score: json.score,
        violations: json.violations || [],
        reason: json.reason,
      };
    } catch {
      return {
        isApproved: true,
        score: 1,
        violations: [],
        reason: "Ошибка при парсинге ответа",
      };
    }
  }

  private getProjectId(): string {
    // Извлечь project ID из API ключа или использовать default
    return process.env.YANDEX_CLOUD_PROJECT_ID || "default";
  }
}

// ============================================================================
// GIGACHAT (SBER)
// ============================================================================

export class GigaChatModerator {
  private apiKey: string;
  private apiUrl = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions";
  private model = "GigaChat";

  constructor(config: ModerationConfig) {
    if (!config.apiKey) {
      throw new Error("GigaChat requires apiKey");
    }
    this.apiKey = config.apiKey;
    if (config.model) this.model = config.model;
  }

  async moderate(request: ModerationRequest): Promise<ModerationResult> {
    const startTime = Date.now();
    const prompt = this.buildPrompt(request);

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: "Ты модератор контента для платформы TaskHive. Проверь текст на соответствие правилам.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 500,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`GigaChat error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const result = this.parseResponse(data.choices[0].message.content);

      return {
        ...result,
        provider: "gigachat",
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error("GigaChat moderation error:", error);
      throw error;
    }
  }

  private buildPrompt(request: ModerationRequest): string {
    return `Проверь текст на соответствие правилам платформы:

Тип: ${request.type}
Текст: "${request.text}"

Проверь: оскорбления, спам, насилие, незаконный контент, персональные данные.

JSON ответ: {"approved": bool, "score": 0-1, "violations": [], "reason": ""}`;
  }

  private parseResponse(text: string): Omit<ModerationResult, "provider" | "processingTime"> {
    try {
      const json = JSON.parse(text);
      return {
        isApproved: json.approved,
        score: json.score,
        violations: json.violations || [],
        reason: json.reason,
      };
    } catch {
      return {
        isApproved: true,
        score: 1,
        violations: [],
        reason: "Ошибка парсинга",
      };
    }
  }
}

// ============================================================================
// DEEPSEEK
// ============================================================================

export class DeepSeekModerator {
  private apiKey: string;
  private apiUrl = "https://api.deepseek.com/chat/completions";
  private model = "deepseek-chat";

  constructor(config: ModerationConfig) {
    if (!config.apiKey) {
      throw new Error("DeepSeek requires apiKey");
    }
    this.apiKey = config.apiKey;
    if (config.model) this.model = config.model;
  }

  async moderate(request: ModerationRequest): Promise<ModerationResult> {
    const startTime = Date.now();
    const prompt = this.buildPrompt(request);

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: "Ты модератор контента. Проверь текст и верни JSON с оценкой.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const result = this.parseResponse(data.choices[0].message.content);

      return {
        ...result,
        provider: "deepseek",
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error("DeepSeek moderation error:", error);
      throw error;
    }
  }

  private buildPrompt(request: ModerationRequest): string {
    return `Проверь текст: "${request.text}"

Ответь JSON: {"approved": bool, "score": 0-1, "violations": [], "reason": ""}`;
  }

  private parseResponse(text: string): Omit<ModerationResult, "provider" | "processingTime"> {
    try {
      const json = JSON.parse(text);
      return {
        isApproved: json.approved,
        score: json.score,
        violations: json.violations || [],
        reason: json.reason,
      };
    } catch {
      return {
        isApproved: true,
        score: 1,
        violations: [],
        reason: "Ошибка парсинга",
      };
    }
  }
}

// ============================================================================
// HUGGINGFACE
// ============================================================================

export class HuggingFaceModerator {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(config: ModerationConfig) {
    if (!config.apiKey) {
      throw new Error("HuggingFace requires apiKey");
    }
    this.apiKey = config.apiKey;
    this.model = config.model || "facebook/roberta-hate-speech-offensive";
    this.apiUrl = `https://api-inference.huggingface.co/models/${this.model}`;
  }

  async moderate(request: ModerationRequest): Promise<ModerationResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: request.text,
        }),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const result = this.parseResponse(data, request.text);

      return {
        ...result,
        provider: "huggingface",
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error("HuggingFace moderation error:", error);
      throw error;
    }
  }

  private parseResponse(
    data: any,
    text: string
  ): Omit<ModerationResult, "provider" | "processingTime"> {
    // HuggingFace возвращает массив с оценками
    if (Array.isArray(data) && data.length > 0) {
      const scores = data[0];
      const hateSpeechScore = scores.find((s: any) => s.label === "LABEL_1")?.score || 0;

      return {
        isApproved: hateSpeechScore < 0.5,
        score: 1 - hateSpeechScore,
        violations: hateSpeechScore > 0.5 ? ["Обнаружена ненавистная речь"] : [],
        reason: `Оценка: ${(hateSpeechScore * 100).toFixed(1)}%`,
      };
    }

    return {
      isApproved: true,
      score: 1,
      violations: [],
      reason: "Не удалось обработать",
    };
  }
}

// ============================================================================
// MODERATION MANAGER
// ============================================================================

export class ModerationManager {
  private providers: Map<LLMProvider, any> = new Map();
  private primaryProvider: LLMProvider;
  private fallbackProviders: LLMProvider[] = [];

  constructor(configs: ModerationConfig[], primaryProvider?: LLMProvider) {
    for (const config of configs) {
      this.registerProvider(config);
    }

    this.primaryProvider = primaryProvider || configs[0].provider;
    this.fallbackProviders = configs.slice(1).map((c) => c.provider);
  }

  private registerProvider(config: ModerationConfig): void {
    switch (config.provider) {
      case "yandex_gpt":
        this.providers.set("yandex_gpt", new YandexGPTModerator(config));
        break;
      case "gigachat":
        this.providers.set("gigachat", new GigaChatModerator(config));
        break;
      case "deepseek":
        this.providers.set("deepseek", new DeepSeekModerator(config));
        break;
      case "huggingface":
        this.providers.set("huggingface", new HuggingFaceModerator(config));
        break;
    }
  }

  /**
   * Модерировать контент с fallback механизмом
   */
  async moderate(request: ModerationRequest): Promise<ModerationResult> {
    const providers = [this.primaryProvider, ...this.fallbackProviders];

    for (const provider of providers) {
      try {
        const moderator = this.providers.get(provider);
        if (!moderator) continue;

        return await moderator.moderate(request);
      } catch (error) {
        console.warn(`Moderation failed with ${provider}, trying fallback...`, error);
        continue;
      }
    }

    // Если все провайдеры не сработали, одобрить контент
    console.error("All moderation providers failed, approving content");
    return {
      isApproved: true,
      score: 1,
      violations: [],
      reason: "Ошибка модерации, контент одобрен",
      provider: this.primaryProvider,
      processingTime: 0,
    };
  }

  /**
   * Получить список доступных провайдеров
   */
  getAvailableProviders(): LLMProvider[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Установить основного провайдера
   */
  setPrimaryProvider(provider: LLMProvider): void {
    if (!this.providers.has(provider)) {
      throw new Error(`Provider ${provider} not configured`);
    }
    this.primaryProvider = provider;
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const ModerationRequestSchema = z.object({
  text: z.string().min(1).max(10000),
  type: z.enum(["task_description" as const, "task_title" as const, "review" as const, "comment" as const, "profile_bio" as const]),
  userId: z.string().optional(),
  contextId: z.string().optional(),
});

export const ModerationConfigSchema = z.object({
  provider: z.enum(["yandex_gpt" as const, "gigachat" as const, "deepseek" as const, "huggingface" as const, "openai" as const]),
  apiKey: z.string().min(1),
  apiUrl: z.string().url().optional(),
  model: z.string().optional(),
  timeout: z.number().optional(),
});
