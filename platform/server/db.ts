import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  InsertJob,
  jobs,
  InsertApplication,
  applications,
  InsertUserProfile,
  userProfiles,
  InsertScoringRecord,
  scoringRecords,
  InsertChat,
  chats,
  InsertMessage,
  messages,
  InsertNotification,
  notifications,
  partners,
  pushConsent,
  pushToken,
  pushNotificationLog,
  escrowTransactions,
  insurancePlans,
  insuranceClaims,
  videoInterviews,
  marketplaceIntegrations,
  marketplaceListings,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= Jobs queries =============
export async function createJob(data: InsertJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(jobs).values(data);
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveJobs(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(jobs).where(eq(jobs.status, "active")).limit(limit).offset(offset);
}

export async function getJobsByCategory(category: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(jobs).where(eq(jobs.category, category)).limit(limit).offset(offset);
}

export async function getHotJobs(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(jobs).where(eq(jobs.isHot, true)).limit(limit);
}

// ============= Applications queries =============
export async function createApplication(data: InsertApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(applications).values(data);
}

export async function getApplicationsByWorker(workerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(applications).where(eq(applications.workerId, workerId));
}

export async function getApplicationsByJob(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(applications).where(eq(applications.jobId, jobId));
}

// ============= User Profiles queries =============
export async function createUserProfile(data: InsertUserProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(userProfiles).values(data);
}

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= Scoring queries =============
export async function createOrUpdateScoring(data: InsertScoringRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(scoringRecords).values(data).onDuplicateKeyUpdate({
    set: {
      iqScore: data.iqScore,
      professionalScore: data.professionalScore,
      reliabilityScore: data.reliabilityScore,
      overallScore: data.overallScore,
      scoreLevel: data.scoreLevel,
    },
  });
}

export async function getScoringByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(scoringRecords).where(eq(scoringRecords.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= Chats queries =============
export async function createChat(data: InsertChat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(chats).values(data);
}

export async function getChatsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(chats)
    .where(or(eq(chats.participantOne, userId), eq(chats.participantTwo, userId)));
}

// ============= Messages queries =============
export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(messages).values(data);
}

export async function getMessagesByChatId(chatId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(messages).where(eq(messages.chatId, chatId)).limit(limit);
}

// ============= Notifications queries =============
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(notifications).values(data);
}

export async function getNotificationsByUserId(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq(notifications.userId, userId)).limit(limit);
}

// ============= Partners queries =============
export async function getActivePartners() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(partners).where(eq(partners.isActive, true));
}
