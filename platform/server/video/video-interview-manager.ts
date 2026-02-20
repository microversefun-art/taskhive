import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { videoInterviews } from "../../drizzle/schema";

export class VideoInterviewManager {
  /**
   * Запланировать видеоинтервью
   */
  async scheduleInterview(
    jobId: number,
    clientId: number,
    executorId: number,
    scheduledAt: Date
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const interview = await db.insert(videoInterviews).values({
      jobId,
      clientId,
      executorId,
      status: "scheduled",
      scheduledAt,
    });

    return interview;
  }

  /**
   * Получить интервью по ID
   */
  async getInterviewById(interviewId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const interview = await db
      .select()
      .from(videoInterviews)
      .where(eq(videoInterviews.id, interviewId));

    return interview[0];
  }

  /**
   * Начать видеоинтервью
   */
  async startInterview(interviewId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const interview = await db
      .update(videoInterviews)
      .set({
        status: "in_progress",
        startedAt: new Date(),
      })
      .where(eq(videoInterviews.id, interviewId));

    return interview;
  }

  /**
   * Завершить видеоинтервью
   */
  async completeInterview(
    interviewId: number,
    recordingUrl: string,
    recordingDuration: number,
    notes?: string
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const interview = await db
      .update(videoInterviews)
      .set({
        status: "completed",
        endedAt: new Date(),
        recordingUrl,
        recordingDuration,
        notes,
      })
      .where(eq(videoInterviews.id, interviewId));

    return interview;
  }

  /**
   * Отменить видеоинтервью
   */
  async cancelInterview(interviewId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const interview = await db
      .update(videoInterviews)
      .set({
        status: "cancelled",
      })
      .where(eq(videoInterviews.id, interviewId));

    return interview;
  }

  /**
   * Установить согласие на запись
   */
  async setRecordingConsent(
    interviewId: number,
    userId: number,
    consent: boolean
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const interview = await db.select().from(videoInterviews).where(eq(videoInterviews.id, interviewId));
    if (!interview[0]) throw new Error("Interview not found");

    const isClient = interview[0].clientId === userId;
    const field = isClient ? "clientConsent" : "executorConsent";

    const updated = await db
      .update(videoInterviews)
      .set({
        [field]: consent,
      })
      .where(eq(videoInterviews.id, interviewId));

    return updated;
  }

  /**
   * Получить интервью для пользователя
   */
  async getUserInterviews(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const interviews = await db
      .select()
      .from(videoInterviews);

    return interviews.filter(
      (i: any) => i.clientId === userId || i.executorId === userId
    );
  }

  /**
   * Получить запланированные интервью
   */
  async getScheduledInterviews(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const interviews = await db
      .select()
      .from(videoInterviews);

    return interviews.filter(
      (i: any) =>
        (i.clientId === userId || i.executorId === userId) &&
        i.status === "scheduled" &&
        new Date(i.scheduledAt) > new Date()
    );
  }

  /**
   * Получить завершённые интервью
   */
  async getCompletedInterviews(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const interviews = await db
      .select()
      .from(videoInterviews);

    return interviews.filter(
      (i: any) =>
        (i.clientId === userId || i.executorId === userId) &&
        i.status === "completed"
    );
  }

  /**
   * Получить статистику видеоинтервью
   */
  async getVideoInterviewStats(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const interviews = await db
      .select()
      .from(videoInterviews);

    const userInterviews = interviews.filter(
      (i: any) => i.clientId === userId || i.executorId === userId
    );

    const completed = userInterviews.filter(
      (i: any) => i.status === "completed"
    );
    const scheduled = userInterviews.filter(
      (i: any) => i.status === "scheduled"
    );
    const cancelled = userInterviews.filter(
      (i: any) => i.status === "cancelled"
    );

    const totalDuration = completed.reduce(
      (sum: number, i: any) => sum + (i.recordingDuration || 0),
      0
    );

    return {
      total: userInterviews.length,
      completed: completed.length,
      scheduled: scheduled.length,
      cancelled: cancelled.length,
      totalDuration,
      avgDuration: completed.length > 0 ? totalDuration / completed.length : 0,
    };
  }
}

export const videoInterviewManager = new VideoInterviewManager();
