/**
 * VK Integration for TaskHive
 * Поддержка OAuth, Share, Events, Analytics
 */

import { z } from "zod";

export interface VKConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  apiVersion: string;
}

export interface VKUser {
  id: number;
  first_name: string;
  last_name: string;
  photo_100?: string;
  photo_200?: string;
  city?: {
    id: number;
    title: string;
  };
  bdate?: string;
  sex?: number;
  status?: string;
}

export interface VKAccessToken {
  access_token: string;
  expires_in: number;
  user_id: number;
  email?: string;
}

export interface VKEvent {
  type: "job_created" | "job_completed" | "payment_received" | "rating_updated";
  userId: number;
  data: Record<string, any>;
  timestamp: number;
}

// ============================================================================
// VK OAUTH
// ============================================================================

export class VKOAuth {
  private appId: string;
  private appSecret: string;
  private redirectUri: string;
  private apiVersion: string;
  private apiUrl = "https://api.vk.com/method";
  private oauthUrl = "https://oauth.vk.com";

  constructor(config: VKConfig) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.redirectUri = config.redirectUri;
    this.apiVersion = config.apiVersion;
  }

  /**
   * Получить URL для авторизации
   */
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "email,offline",
      state: state,
      display: "popup",
      v: this.apiVersion,
    });

    return `${this.oauthUrl}/authorize?${params.toString()}`;
  }

  /**
   * Обменять код на токен
   */
  async exchangeCodeForToken(code: string): Promise<VKAccessToken> {
    try {
      const params = new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        redirect_uri: this.redirectUri,
        code: code,
      });

      const response = await fetch(`${this.oauthUrl}/access_token?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`VK OAuth error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      if (data.error) {
        throw new Error(`VK OAuth error: ${data.error_description}`);
      }

      return {
        access_token: data.access_token,
        expires_in: data.expires_in,
        user_id: data.user_id,
        email: data.email,
      };
    } catch (error) {
      console.error("[VK] OAuth error:", error);
      throw error;
    }
  }

  /**
   * Получить информацию о пользователе
   */
  async getUserInfo(accessToken: string, userId: number): Promise<VKUser> {
    try {
      const params = new URLSearchParams({
        user_ids: userId.toString(),
        fields: "photo_100,photo_200,city,bdate,sex,status",
        access_token: accessToken,
        v: this.apiVersion,
      });

      const response = await fetch(`${this.apiUrl}/users.get?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`VK API error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      if (data.error) {
        throw new Error(`VK API error: ${data.error.error_msg}`);
      }

      const user = data.response[0];
      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_100: user.photo_100,
        photo_200: user.photo_200,
        city: user.city,
        bdate: user.bdate,
        sex: user.sex,
        status: user.status,
      };
    } catch (error) {
      console.error("[VK] Get user info error:", error);
      throw error;
    }
  }

  /**
   * Проверить валидность токена
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        access_token: accessToken,
        v: this.apiVersion,
      });

      const response = await fetch(`${this.apiUrl}/secure.checkToken?${params.toString()}`);

      if (!response.ok) {
        return false;
      }

      const data = await response.json() as any;
      return !data.error;
    } catch (error) {
      console.error("[VK] Token validation error:", error);
      return false;
    }
  }
}

// ============================================================================
// VK SHARE & EVENTS
// ============================================================================

export class VKShare {
  private appId: string;
  private apiVersion: string;
  private apiUrl = "https://api.vk.com/method";

  constructor(appId: string, apiVersion: string) {
    this.appId = appId;
    this.apiVersion = apiVersion;
  }

  /**
   * Поделиться вакансией в ВК
   */
  async shareJob(
    accessToken: string,
    jobId: string,
    jobTitle: string,
    jobDescription: string,
    jobSalary: number,
    imageUrl?: string
  ): Promise<boolean> {
    try {
      const text = `💼 ${jobTitle}\n💰 ${jobSalary} ₽\n\n${jobDescription}\n\n🔗 https://taskhive.com/jobs/${jobId}`;

      const params = new URLSearchParams({
        access_token: accessToken,
        message: text,
        attachments: imageUrl ? `photo,-${this.appId}` : "",
        v: this.apiVersion,
      });

      const response = await fetch(`${this.apiUrl}/wall.post?${params.toString()}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`VK Share error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return !data.error;
    } catch (error) {
      console.error("[VK] Share error:", error);
      return false;
    }
  }

  /**
   * Отправить событие в ВК
   */
  async trackEvent(
    accessToken: string,
    userId: number,
    event: VKEvent
  ): Promise<boolean> {
    try {
      const eventData = {
        event_name: event.type,
        user_id: userId,
        timestamp: event.timestamp,
        ...event.data,
      };

      const params = new URLSearchParams({
        access_token: accessToken,
        pixel_code: this.appId,
        event: JSON.stringify(eventData),
        v: this.apiVersion,
      });

      const response = await fetch(`${this.apiUrl}/events.track?${params.toString()}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`VK Track event error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return !data.error;
    } catch (error) {
      console.error("[VK] Track event error:", error);
      return false;
    }
  }
}

// ============================================================================
// VK ANALYTICS
// ============================================================================

export class VKAnalytics {
  private appId: string;
  private accessToken: string;
  private apiVersion: string;
  private apiUrl = "https://api.vk.com/method";

  constructor(appId: string, accessToken: string, apiVersion: string) {
    this.appId = appId;
    this.accessToken = accessToken;
    this.apiVersion = apiVersion;
  }

  /**
   * Получить статистику приложения
   */
  async getAppStats(dateFrom: string, dateTo: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        app_id: this.appId,
        date_from: dateFrom,
        date_to: dateTo,
        access_token: this.accessToken,
        v: this.apiVersion,
      });

      const response = await fetch(`${this.apiUrl}/stats.get?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`VK Analytics error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      if (data.error) {
        throw new Error(`VK Analytics error: ${data.error.error_msg}`);
      }

      return data.response;
    } catch (error) {
      console.error("[VK] Analytics error:", error);
      return null;
    }
  }

  /**
   * Получить демографию пользователей
   */
  async getDemographics(): Promise<any> {
    try {
      const params = new URLSearchParams({
        app_id: this.appId,
        access_token: this.accessToken,
        v: this.apiVersion,
      });

      const response = await fetch(`${this.apiUrl}/stats.getDemographics?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`VK Demographics error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      if (data.error) {
        throw new Error(`VK Demographics error: ${data.error.error_msg}`);
      }

      return data.response;
    } catch (error) {
      console.error("[VK] Demographics error:", error);
      return null;
    }
  }
}

// ============================================================================
// VK MINI APP
// ============================================================================

export class VKMiniApp {
  private appId: string;
  private apiVersion: string;
  private apiUrl = "https://api.vk.com/method";

  constructor(appId: string, apiVersion: string) {
    this.appId = appId;
    this.apiVersion = apiVersion;
  }

  /**
   * Отправить push-уведомление в VK Mini App
   */
  async sendPush(
    accessToken: string,
    userId: number,
    title: string,
    text: string,
    actionUrl?: string
  ): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        user_id: userId.toString(),
        message: `${title}\n${text}`,
        access_token: accessToken,
        v: this.apiVersion,
      });

      const response = await fetch(`${this.apiUrl}/notifications.sendMessage?${params.toString()}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`VK Push error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return !data.error;
    } catch (error) {
      console.error("[VK] Push error:", error);
      return false;
    }
  }

  /**
   * Получить информацию о Mini App пользователя
   */
  async getUserAppInfo(accessToken: string, userId: number): Promise<any> {
    try {
      const params = new URLSearchParams({
        user_id: userId.toString(),
        access_token: accessToken,
        v: this.apiVersion,
      });

      const response = await fetch(`${this.apiUrl}/apps.getScopes?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`VK App info error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      if (data.error) {
        throw new Error(`VK App info error: ${data.error.error_msg}`);
      }

      return data.response;
    } catch (error) {
      console.error("[VK] App info error:", error);
      return null;
    }
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const VKConfigSchema = z.object({
  appId: z.string().min(1),
  appSecret: z.string().min(1),
  redirectUri: z.string().url(),
  apiVersion: z.string().default("5.131"),
});

export const VKEventSchema = z.object({
  type: z.enum(["job_created" as const, "job_completed" as const, "payment_received" as const, "rating_updated" as const]),
  userId: z.number(),
  data: z.record(z.string(), z.any()),
  timestamp: z.number(),
});
