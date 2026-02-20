import { eq } from "drizzle-orm";
import { getDb } from "../db";
import {
  marketplaceIntegrations,
  marketplaceListings,
  jobs,
} from "../../drizzle/schema";

export class MarketplaceSyncManager {
  /**
   * Подключить маркетплейс
   */
  async connectMarketplace(
    userId: number,
    marketplace: "yandex_rabota" | "headhunter" | "avito",
    externalId: string,
    accessToken: string,
    refreshToken?: string
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const integration = await db.insert(marketplaceIntegrations).values({
      userId,
      marketplace,
      externalId,
      accessToken,
      refreshToken,
      status: "connected",
    });

    return integration;
  }

  /**
   * Получить интеграцию пользователя
   */
  async getUserIntegration(
    userId: number,
    marketplace: "yandex_rabota" | "headhunter" | "avito"
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const integrations = await db
      .select()
      .from(marketplaceIntegrations);

    return integrations.find(
      (i: any) => i.userId === userId && i.marketplace === marketplace
    );
  }

  /**
   * Отключить маркетплейс
   */
  async disconnectMarketplace(integrationId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const integration = await db
      .update(marketplaceIntegrations)
      .set({
        status: "disconnected",
      })
      .where(eq(marketplaceIntegrations.id, integrationId));

    return integration;
  }

  /**
   * Опубликовать вакансию на маркетплейс
   */
  async publishListing(
    jobId: number,
    marketplace: "yandex_rabota" | "headhunter" | "avito",
    externalJobId: string
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const listing = await db.insert(marketplaceListings).values({
      jobId,
      marketplace,
      externalJobId,
      status: "published",
    });

    return listing;
  }

  /**
   * Получить листинги вакансии
   */
  async getJobListings(jobId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const listings = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.jobId, jobId));

    return listings;
  }

  /**
   * Обновить статистику листинга
   */
  async updateListingStats(
    listingId: number,
    viewCount: number,
    applicationCount: number
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const listing = await db
      .update(marketplaceListings)
      .set({
        viewCount,
        applicationCount,
        lastSyncAt: new Date(),
      })
      .where(eq(marketplaceListings.id, listingId));

    return listing;
  }

  /**
   * Архивировать листинг
   */
  async archiveListing(listingId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const listing = await db
      .update(marketplaceListings)
      .set({
        status: "archived",
      })
      .where(eq(marketplaceListings.id, listingId));

    return listing;
  }

  /**
   * Получить статистику маркетплейса
   */
  async getMarketplaceStats(
    userId: number,
    marketplace: "yandex_rabota" | "headhunter" | "avito"
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get user's jobs
    const userJobs = await db.select().from(jobs);
    const userJobIds = userJobs
      .filter((j: any) => j.employerId === userId)
      .map((j: any) => j.id);

    if (userJobIds.length === 0) {
      return {
        totalListings: 0,
        publishedListings: 0,
        totalViews: 0,
        totalApplications: 0,
        avgViewsPerListing: 0,
        avgApplicationsPerListing: 0,
      };
    }

    // Get listings for this marketplace
    const listings = await db.select().from(marketplaceListings);
    const marketplaceListingsFiltered = listings.filter(
      (l: any) =>
        userJobIds.includes(l.jobId) && l.marketplace === marketplace
    );

    const totalViews = marketplaceListingsFiltered.reduce(
      (sum: number, l: any) => sum + (l.viewCount || 0),
      0
    );
    const totalApplications = marketplaceListingsFiltered.reduce(
      (sum: number, l: any) => sum + (l.applicationCount || 0),
      0
    );

    return {
      totalListings: marketplaceListingsFiltered.length,
      publishedListings: marketplaceListingsFiltered.filter(
        (l: any) => l.status === "published"
      ).length,
      totalViews,
      totalApplications,
      avgViewsPerListing:
        marketplaceListingsFiltered.length > 0
          ? totalViews / marketplaceListingsFiltered.length
          : 0,
      avgApplicationsPerListing:
        marketplaceListingsFiltered.length > 0
          ? totalApplications / marketplaceListingsFiltered.length
          : 0,
    };
  }

  /**
   * Синхронизировать все листинги
   */
  async syncAllListings(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get all user's listings
    const userJobs = await db.select().from(jobs);
    const userJobIds = userJobs
      .filter((j: any) => j.employerId === userId)
      .map((j: any) => j.id);

    if (userJobIds.length === 0) return [];

    const listings = await db.select().from(marketplaceListings);
    const userListings = listings.filter((l: any) =>
      userJobIds.includes(l.jobId)
    );

    // Update lastSyncAt for all listings
    for (const listing of userListings) {
      await db
        .update(marketplaceListings)
        .set({
          lastSyncAt: new Date(),
        })
        .where(eq(marketplaceListings.id, listing.id));
    }

    return userListings;
  }
}

export const marketplaceSyncManager = new MarketplaceSyncManager();
