/**
 * MAX Integration for TaskHive
 * Поддержка рекламы, аналитики, конверсий
 */

import { z } from "zod";

export interface MAXConfig {
  apiKey: string;
  apiUrl: string;
  accountId: string;
}

export interface MAXCampaign {
  id: string;
  name: string;
  status: "active" | "paused" | "archived";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roi: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MAXAd {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  imageUrl?: string;
  landingUrl: string;
  status: "active" | "paused" | "rejected";
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface MAXConversion {
  id: string;
  campaignId: string;
  userId: string;
  type: "job_applied" | "job_completed" | "subscription" | "payment";
  value: number;
  timestamp: Date;
}

export interface MAXAnalytics {
  campaignId: string;
  dateFrom: string;
  dateTo: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  revenue: number;
  roi: number;
  ctr: number;
  cpc: number;
  cpa: number;
}

// ============================================================================
// MAX CAMPAIGNS
// ============================================================================

export class MAXCampaigns {
  private apiKey: string;
  private apiUrl: string;
  private accountId: string;

  constructor(config: MAXConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
    this.accountId = config.accountId;
  }

  /**
   * Создать кампанию
   */
  async createCampaign(
    name: string,
    budget: number,
    dailyBudget: number,
    targetAudience: Record<string, any>
  ): Promise<MAXCampaign> {
    try {
      const payload = {
        name: name,
        budget: budget,
        daily_budget: dailyBudget,
        target_audience: targetAudience,
        status: "active",
      };

      const response = await fetch(`${this.apiUrl}/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`MAX Campaign error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: data.id,
        name: data.name,
        status: data.status,
        budget: data.budget,
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        cpa: 0,
        roi: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error("[MAX] Campaign creation error:", error);
      throw error;
    }
  }

  /**
   * Получить кампанию
   */
  async getCampaign(campaignId: string): Promise<MAXCampaign> {
    try {
      const response = await fetch(`${this.apiUrl}/campaigns/${campaignId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`MAX Campaign error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: data.id,
        name: data.name,
        status: data.status,
        budget: data.budget,
        spent: data.spent,
        impressions: data.impressions,
        clicks: data.clicks,
        conversions: data.conversions,
        ctr: data.ctr,
        cpc: data.cpc,
        cpa: data.cpa,
        roi: data.roi,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error("[MAX] Get campaign error:", error);
      throw error;
    }
  }

  /**
   * Обновить кампанию
   */
  async updateCampaign(
    campaignId: string,
    updates: Partial<MAXCampaign>
  ): Promise<MAXCampaign> {
    try {
      const payload: any = {};

      if (updates.name) payload.name = updates.name;
      if (updates.budget) payload.budget = updates.budget;
      if (updates.status) payload.status = updates.status;

      const response = await fetch(`${this.apiUrl}/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`MAX Campaign update error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: data.id,
        name: data.name,
        status: data.status,
        budget: data.budget,
        spent: data.spent,
        impressions: data.impressions,
        clicks: data.clicks,
        conversions: data.conversions,
        ctr: data.ctr,
        cpc: data.cpc,
        cpa: data.cpa,
        roi: data.roi,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error("[MAX] Campaign update error:", error);
      throw error;
    }
  }

  /**
   * Получить все кампании
   */
  async getCampaigns(limit: number = 50, offset: number = 0): Promise<MAXCampaign[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`${this.apiUrl}/campaigns?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`MAX Campaigns error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return data.campaigns.map((c: any) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        budget: c.budget,
        spent: c.spent,
        impressions: c.impressions,
        clicks: c.clicks,
        conversions: c.conversions,
        ctr: c.ctr,
        cpc: c.cpc,
        cpa: c.cpa,
        roi: c.roi,
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      }));
    } catch (error) {
      console.error("[MAX] Get campaigns error:", error);
      return [];
    }
  }
}

// ============================================================================
// MAX ADS
// ============================================================================

export class MAXAds {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  /**
   * Создать объявление
   */
  async createAd(
    campaignId: string,
    title: string,
    description: string,
    landingUrl: string,
    imageUrl?: string
  ): Promise<MAXAd> {
    try {
      const payload = {
        campaign_id: campaignId,
        title: title,
        description: description,
        landing_url: landingUrl,
        image_url: imageUrl,
        status: "active",
      };

      const response = await fetch(`${this.apiUrl}/ads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`MAX Ad error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: data.id,
        campaignId: data.campaign_id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url,
        landingUrl: data.landing_url,
        status: data.status,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      };
    } catch (error) {
      console.error("[MAX] Ad creation error:", error);
      throw error;
    }
  }

  /**
   * Получить объявление
   */
  async getAd(adId: string): Promise<MAXAd> {
    try {
      const response = await fetch(`${this.apiUrl}/ads/${adId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`MAX Ad error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: data.id,
        campaignId: data.campaign_id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url,
        landingUrl: data.landing_url,
        status: data.status,
        impressions: data.impressions,
        clicks: data.clicks,
        conversions: data.conversions,
      };
    } catch (error) {
      console.error("[MAX] Get ad error:", error);
      throw error;
    }
  }

  /**
   * Получить объявления кампании
   */
  async getCampaignAds(campaignId: string): Promise<MAXAd[]> {
    try {
      const params = new URLSearchParams({
        campaign_id: campaignId,
      });

      const response = await fetch(`${this.apiUrl}/ads?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`MAX Ads error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return data.ads.map((a: any) => ({
        id: a.id,
        campaignId: a.campaign_id,
        title: a.title,
        description: a.description,
        imageUrl: a.image_url,
        landingUrl: a.landing_url,
        status: a.status,
        impressions: a.impressions,
        clicks: a.clicks,
        conversions: a.conversions,
      }));
    } catch (error) {
      console.error("[MAX] Get campaign ads error:", error);
      return [];
    }
  }
}

// ============================================================================
// MAX CONVERSIONS & TRACKING
// ============================================================================

export class MAXTracking {
  private apiKey: string;
  private apiUrl: string;
  private pixelId: string;

  constructor(apiKey: string, apiUrl: string, pixelId: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.pixelId = pixelId;
  }

  /**
   * Отследить конверсию
   */
  async trackConversion(
    campaignId: string,
    userId: string,
    type: string,
    value: number
  ): Promise<boolean> {
    try {
      const payload = {
        pixel_id: this.pixelId,
        campaign_id: campaignId,
        user_id: userId,
        conversion_type: type,
        value: value,
        timestamp: Date.now(),
      };

      const response = await fetch(`${this.apiUrl}/conversions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`MAX Conversion error: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("[MAX] Conversion tracking error:", error);
      return false;
    }
  }

  /**
   * Получить конверсии кампании
   */
  async getCampaignConversions(campaignId: string): Promise<MAXConversion[]> {
    try {
      const params = new URLSearchParams({
        campaign_id: campaignId,
      });

      const response = await fetch(`${this.apiUrl}/conversions?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`MAX Conversions error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return data.conversions.map((c: any) => ({
        id: c.id,
        campaignId: c.campaign_id,
        userId: c.user_id,
        type: c.conversion_type,
        value: c.value,
        timestamp: new Date(c.timestamp),
      }));
    } catch (error) {
      console.error("[MAX] Get conversions error:", error);
      return [];
    }
  }
}

// ============================================================================
// MAX ANALYTICS INTERFACE
// ============================================================================

export interface IMAXAnalytics {
  campaignId: string;
  dateFrom: string;
  dateTo: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  revenue: number;
  roi: number;
  ctr: number;
  cpc: number;
  cpa: number;
}

// ============================================================================
// MAX ANALYTICS
// ============================================================================

export class MAXAnalyticsService {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  /**
   * Получить аналитику кампании
   */
  async getCampaignAnalytics(
    campaignId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<IMAXAnalytics> {
    try {
      const params = new URLSearchParams({
        campaign_id: campaignId,
        date_from: dateFrom,
        date_to: dateTo,
      });

      const response = await fetch(`${this.apiUrl}/analytics?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`MAX Analytics error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      const result: IMAXAnalytics = {
        campaignId: data.campaign_id,
        dateFrom: data.date_from,
        dateTo: data.date_to,
        impressions: data.impressions,
        clicks: data.clicks,
        conversions: data.conversions,
        spent: data.spent,
        revenue: data.revenue,
        roi: data.roi,
        ctr: data.ctr,
        cpc: data.cpc,
        cpa: data.cpa,
      };
      return result;
    } catch (error) {
      console.error("[MAX] Analytics error:", error);
      throw error;
    }
  }

  /**
   * Получить общую аналитику
   */
  async getAccountAnalytics(dateFrom: string, dateTo: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        date_from: dateFrom,
        date_to: dateTo,
      });

      const response = await fetch(`${this.apiUrl}/analytics/account?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`MAX Account Analytics error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[MAX] Account analytics error:", error);
      return null;
    }
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const MAXConfigSchema = z.object({
  apiKey: z.string().min(1),
  apiUrl: z.string().url(),
  accountId: z.string().min(1),
});

export const MAXCampaignSchema = z.object({
  name: z.string().min(1),
  budget: z.number().positive(),
  dailyBudget: z.number().positive(),
  targetAudience: z.record(z.string(), z.any()),
});

export const MAXAdSchema = z.object({
  campaignId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  landingUrl: z.string().url(),
  imageUrl: z.string().url().optional(),
});

export const MAXConversionSchema = z.object({
  campaignId: z.string().min(1),
  userId: z.string().min(1),
  type: z.enum(["job_applied" as const, "job_completed" as const, "subscription" as const, "payment" as const]),
  value: z.number().positive(),
});
