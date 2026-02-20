import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Jobs table - Вакансии
 */
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  employerId: int("employerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // склад, доставка, курьер, ритейл и др.
  salary: int("salary"), // в рублях
  salaryMin: int("salaryMin"),
  salaryMax: int("salaryMax"),
  location: varchar("location", { length: 255 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(), // Регион России или СНГ
  requirements: text("requirements"),
  duration: varchar("duration", { length: 50 }), // краткосрочная, долгосрочная
  status: mysqlEnum("status", ["active", "closed", "archived"]).default("active").notNull(),
  isHot: boolean("isHot").default(false), // для горячих вакансий
  isFraud: boolean("isFraud").default(false), // флаг подозрения на мошенничество
  viewCount: int("viewCount").default(0),
  applicationsCount: int("applicationsCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

/**
 * Job Applications table - Отклики на вакансии
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  workerId: int("workerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "completed"]).default("pending").notNull(),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
  completedAt: timestamp("completedAt"),
  rating: int("rating"), // Рейтинг работника за эту работу (1-5)
  review: text("review"), // Отзыв работодателя
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * User Profiles table - Профили пользователей с дополнительной информацией
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  userType: mysqlEnum("userType", ["worker", "employer"]).notNull(),
  bio: text("bio"),
  avatar: varchar("avatar", { length: 500 }), // URL к аватару в S3
  phone: varchar("phone", { length: 20 }),
  skills: text("skills"), // JSON массив навыков
  experience: int("experience"), // Опыт в годах
  isVerified: boolean("isVerified").default(false),
  verificationMethod: varchar("verificationMethod", { length: 50 }), // document, messenger, phone
  averageRating: varchar("averageRating", { length: 10 }).default("0"), // Средний рейтинг
  totalReviews: int("totalReviews").default(0),
  completedJobs: int("completedJobs").default(0),
  companyName: varchar("companyName", { length: 255 }), // для работодателей
  companyDescription: text("companyDescription"),
  website: varchar("website", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Scoring System table - Скоринговая система
 */
export const scoringRecords = mysqlTable("scoringRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  iqScore: int("iqScore"), // IQ оценка (0-200)
  professionalScore: int("professionalScore"), // Профессиональный рейтинг (0-100)
  reliabilityScore: int("reliabilityScore"), // Надежность (0-100)
  overallScore: int("overallScore"), // Итоговый скор (0-100)
  scoreLevel: mysqlEnum("scoreLevel", ["low", "medium", "high", "excellent"]).default("low"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScoringRecord = typeof scoringRecords.$inferSelect;
export type InsertScoringRecord = typeof scoringRecords.$inferInsert;

/**
 * Chats table - Чаты между работниками и работодателями
 */
export const chats = mysqlTable("chats", {
  id: int("id").autoincrement().primaryKey(),
  participantOne: int("participantOne").notNull().references(() => users.id, { onDelete: "cascade" }),
  participantTwo: int("participantTwo").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobId: int("jobId").references(() => jobs.id, { onDelete: "set null" }),
  lastMessage: text("lastMessage"),
  lastMessageAt: timestamp("lastMessageAt"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;

/**
 * Messages table - Сообщения в чатах
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  chatId: int("chatId").notNull().references(() => chats.id, { onDelete: "cascade" }),
  senderId: int("senderId").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Partners/Sponsors table - Спонсоры и партнеры
 */
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logo: varchar("logo", { length: 500 }), // URL логотипа
  sponsorLevel: mysqlEnum("sponsorLevel", ["platinum", "gold", "silver"]).notNull(),
  description: text("description"),
  website: varchar("website", { length: 500 }),
  isActive: boolean("isActive").default(true),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Notifications table - Уведомления
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // new_job, new_application, message, etc
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  relatedId: int("relatedId"), // ID связанного объекта (job, application, etc)
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
/**
 * Referral Program - Реферальная программа
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredId: int("referredId").notNull().references(() => users.id, { onDelete: "cascade" }),
  referralCode: varchar("referralCode", { length: 32 }).notNull().unique(), // Уникальный код приглашения
  status: mysqlEnum("status", ["pending", "active", "inactive"]).default("pending").notNull(), // pending = не активирован, active = активирован
  bonusPercentage: int("bonusPercentage").default(10).notNull(), // 10-20% от комиссии
  totalEarned: int("totalEarned").default(0).notNull(), // Всего заработано в копейках
  totalCommission: int("totalCommission").default(0).notNull(), // Общая комиссия от рефералов
  activatedAt: timestamp("activatedAt"), // Когда реферал активировался
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Referral Bonuses - Бонусы от рефералов
 */
export const referralBonuses = mysqlTable("referralBonuses", {
  id: int("id").autoincrement().primaryKey(),
  referralId: int("referralId").notNull().references(() => referrals.id, { onDelete: "cascade" }),
  referrerId: int("referrerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredId: int("referredId").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: int("orderId"), // ID заказа, который принёс бонус
  commissionAmount: int("commissionAmount").notNull(), // Комиссия от заказа в копейках
  bonusAmount: int("bonusAmount").notNull(), // Бонус рефереру в копейках
  bonusPercentage: int("bonusPercentage").notNull(), // Процент бонуса (10-20%)
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"), // Когда был выплачен бонус
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralBonus = typeof referralBonuses.$inferSelect;
export type InsertReferralBonus = typeof referralBonuses.$inferInsert;

/**
 * Referral Payouts - Выплаты по реферальной программе
 */
export const referralPayouts = mysqlTable("referralPayouts", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalAmount: int("totalAmount").notNull(), // Общая сумма выплаты в копейках
  bonusCount: int("bonusCount").notNull(), // Количество бонусов в выплате
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // robokassa, yandex, sber, tinkoff
  transactionId: varchar("transactionId", { length: 255 }), // ID транзакции платёжной системы
  failureReason: text("failureReason"), // Причина ошибки, если статус failed
  processedAt: timestamp("processedAt"), // Когда была обработана выплата
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralPayout = typeof referralPayouts.$inferSelect;
export type InsertReferralPayout = typeof referralPayouts.$inferInsert;

/**
 * Referral Stats - Статистика реферальной программы
 */
export const referralStats = mysqlTable("referralStats", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  totalReferrals: int("totalReferrals").default(0).notNull(), // Всего приглашено
  activeReferrals: int("activeReferrals").default(0).notNull(), // Активных рефералов
  totalBonusEarned: int("totalBonusEarned").default(0).notNull(), // Всего заработано бонусов
  totalBonusPaid: int("totalBonusPaid").default(0).notNull(), // Всего выплачено бонусов
  totalBonusPending: int("totalBonusPending").default(0).notNull(), // Ожидающих выплаты
  averageBonusPerReferral: int("averageBonusPerReferral").default(0).notNull(), // Средний бонус на реферала
  lastPayoutDate: timestamp("lastPayoutDate"), // Дата последней выплаты
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralStat = typeof referralStats.$inferSelect;
export type InsertReferralStat = typeof referralStats.$inferInsert;

/**
 * Push Consent - Согласие на push-уведомления (ФЗ-152)
 */
export const pushConsent = mysqlTable("pushConsent", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  consentGiven: boolean("consentGiven").default(false).notNull(),
  consentDate: timestamp("consentDate"), // Когда было дано согласие
  consentVersion: varchar("consentVersion", { length: 10 }).default("1.0").notNull(), // Версия политики
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 или IPv6
  userAgent: text("userAgent"), // User-Agent браузера/приложения
  revokedAt: timestamp("revokedAt"), // Когда было отозвано согласие
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushConsent = typeof pushConsent.$inferSelect;
export type InsertPushConsent = typeof pushConsent.$inferInsert;

/**
 * Push Token - Токены для push-уведомлений
 * Требует активного согласия (pushConsent.consentGiven = true)
 */
export const pushToken = mysqlTable("pushToken", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(), // Firebase token
  platform: mysqlEnum("platform", ["ios", "android", "web"]).notNull(),
  deviceName: varchar("deviceName", { length: 255 }), // Название устройства
  osVersion: varchar("osVersion", { length: 50 }), // Версия ОС
  appVersion: varchar("appVersion", { length: 50 }), // Версия приложения
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(), // Токен истекает через 30 дней
});

export type PushToken = typeof pushToken.$inferSelect;
export type InsertPushToken = typeof pushToken.$inferInsert;

/**
 * Push Notification Log - Логирование отправленных уведомлений
 * Для аудита и отладки (хранится 90 дней)
 */
export const pushNotificationLog = mysqlTable("pushNotificationLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  notificationType: varchar("notificationType", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  platform: mysqlEnum("platform", ["ios", "android", "web"]),
  status: mysqlEnum("status", ["sent", "delivered", "failed"]).default("sent").notNull(),
  errorMessage: text("errorMessage"), // Сообщение об ошибке, если статус = failed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushNotificationLog = typeof pushNotificationLog.$inferSelect;
export type InsertPushNotificationLog = typeof pushNotificationLog.$inferInsert;


/**
 * Escrow Transactions - Эскроу-система
 * Удержание денег до завершения проекта
 */
export const escrowTransactions = mysqlTable("escrowTransactions", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  clientId: int("clientId").notNull().references(() => users.id, { onDelete: "cascade" }),
  executorId: int("executorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: int("amount").notNull(), // в копейках (рубли * 100)
  status: mysqlEnum("status", ["pending", "held", "released", "refunded", "disputed"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(), // robokassa, yandex_kassa, etc
  paymentId: varchar("paymentId", { length: 255 }), // ID платежа в системе платежей
  releaseDate: timestamp("releaseDate"), // Дата выпуска денег
  disputeReason: text("disputeReason"), // Причина спора
  arbitrationResult: mysqlEnum("arbitrationResult", ["client_win", "executor_win", "split"]), // Результат арбитража
  arbitrationNotes: text("arbitrationNotes"), // Заметки арбитра
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EscrowTransaction = typeof escrowTransactions.$inferSelect;
export type InsertEscrowTransaction = typeof escrowTransactions.$inferInsert;

/**
 * Insurance Plans - Система страхования
 * Страховка для исполнителей и клиентов
 */
export const insurancePlans = mysqlTable("insurancePlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  planType: mysqlEnum("planType", ["executor_protection", "client_protection", "both"]).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "expired"]).default("active").notNull(),
  monthlyPrice: int("monthlyPrice").notNull(), // в копейках
  coverageAmount: int("coverageAmount").notNull(), // максимальная сумма покрытия
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  autoRenewal: boolean("autoRenewal").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InsurancePlan = typeof insurancePlans.$inferSelect;
export type InsertInsurancePlan = typeof insurancePlans.$inferInsert;

/**
 * Insurance Claims - Страховые претензии
 * Заявки на страховое возмещение
 */
export const insuranceClaims = mysqlTable("insuranceClaims", {
  id: int("id").autoincrement().primaryKey(),
  insurancePlanId: int("insurancePlanId").notNull().references(() => insurancePlans.id, { onDelete: "cascade" }),
  jobId: int("jobId").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  claimReason: text("claimReason").notNull(),
  claimAmount: int("claimAmount").notNull(), // в копейках
  status: mysqlEnum("status", ["pending", "approved", "rejected", "paid"]).default("pending").notNull(),
  evidence: text("evidence"), // JSON с ссылками на доказательства
  approvalDate: timestamp("approvalDate"),
  paymentDate: timestamp("paymentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type InsertInsuranceClaim = typeof insuranceClaims.$inferInsert;

/**
 * Video Interviews - Видеоинтервью
 * Встроенное видео между клиентом и исполнителем
 */
export const videoInterviews = mysqlTable("videoInterviews", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  clientId: int("clientId").notNull().references(() => users.id, { onDelete: "cascade" }),
  executorId: int("executorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  recordingUrl: varchar("recordingUrl", { length: 500 }), // URL видеозаписи в S3 (РФ)
  recordingDuration: int("recordingDuration"), // длительность в секундах
  clientConsent: boolean("clientConsent").default(false).notNull(), // согласие на запись
  executorConsent: boolean("executorConsent").default(false).notNull(), // согласие на запись
  notes: text("notes"), // заметки после интервью
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoInterview = typeof videoInterviews.$inferSelect;
export type InsertVideoInterview = typeof videoInterviews.$inferInsert;

/**
 * Marketplace Integrations - Интеграция с маркетплейсами
 * Синхронизация вакансий с Яндекс.Работа, HeadHunter, Авито
 */
export const marketplaceIntegrations = mysqlTable("marketplaceIntegrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  marketplace: mysqlEnum("marketplace", ["yandex_rabota", "headhunter", "avito"]).notNull(),
  externalId: varchar("externalId", { length: 255 }).notNull(), // ID в маркетплейсе
  accessToken: text("accessToken"), // Токен доступа (зашифрован)
  refreshToken: text("refreshToken"), // Refresh token (зашифрован)
  status: mysqlEnum("status", ["connected", "disconnected", "error"]).default("connected").notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  syncErrorMessage: text("syncErrorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketplaceIntegration = typeof marketplaceIntegrations.$inferSelect;
export type InsertMarketplaceIntegration = typeof marketplaceIntegrations.$inferInsert;

/**
 * Marketplace Listings - Синхронизированные вакансии
 * Отслеживание вакансий, опубликованных на маркетплейсах
 */
export const marketplaceListings = mysqlTable("marketplaceListings", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  marketplace: mysqlEnum("marketplace", ["yandex_rabota", "headhunter", "avito"]).notNull(),
  externalJobId: varchar("externalJobId", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["published", "archived", "error"]).default("published").notNull(),
  viewCount: int("viewCount").default(0), // просмотры на маркетплейсе
  applicationCount: int("applicationCount").default(0), // заявки на маркетплейсе
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = typeof marketplaceListings.$inferInsert;


/**
 * Achievements System - Система достижений v19.0
 * Отслеживание достижений, уровней и прогресса пользователей
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(), // first_order, orders_100, rating_5stars, referral_10, executor_verified, custom
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }), // emoji или URL
  points: int("points").default(0),
  badge: mysqlEnum("badge", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User Levels - Уровни пользователей
 * Система прогрессии с опытом и уровнями (1-50)
 */
export const userLevels = mysqlTable("userLevels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  level: int("level").default(1).notNull(),
  experience: int("experience").default(0).notNull(),
  totalPoints: int("totalPoints").default(0).notNull(),
  totalAchievements: int("totalAchievements").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UserLevel = typeof userLevels.$inferSelect;
export type InsertUserLevel = typeof userLevels.$inferInsert;

/**
 * Recommendations - Система рекомендаций v19.0
 * AI-powered рекомендации вакансий для исполнителей и кандидатов для клиентов
 */
export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobId: int("jobId").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["executor", "client"]).notNull(), // для исполнителя или клиента
  score: decimal("score", { precision: 5, scale: 2 }).default("0.00").notNull(), // 0-100 score
  reason: text("reason"), // причина рекомендации
  clicked: boolean("clicked").default(false).notNull(),
  applied: boolean("applied").default(false).notNull(),
  clickedAt: timestamp("clickedAt"),
  appliedAt: timestamp("appliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

/**
 * User Interactions - Отслеживание взаимодействий для рекомендаций
 * Используется для обучения AI модели рекомендаций
 */
export const userInteractions = mysqlTable("userInteractions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobId: int("jobId").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  action: mysqlEnum("action", ["view", "apply", "save", "complete", "reject"]).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
export type UserInteraction = typeof userInteractions.$inferSelect;
export type InsertUserInteraction = typeof userInteractions.$inferInsert;

/**
 * Recurring Orders - Система повторяющихся заказов v19.0
 * Подписки на регулярные работы с автоматическими скидками
 */
export const recurringOrders = mysqlTable("recurringOrders", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => users.id, { onDelete: "cascade" }),
  executorId: int("executorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobId: int("jobId").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "biweekly", "monthly"]).notNull(),
  discount: int("discount").default(10).notNull(), // скидка в процентах (10-30%)
  status: mysqlEnum("status", ["active", "paused", "cancelled"]).default("active").notNull(),
  totalOrders: int("totalOrders").default(0).notNull(),
  totalSavings: decimal("totalSavings", { precision: 12, scale: 2 }).default("0.00").notNull(),
  nextOrderDate: timestamp("nextOrderDate"),
  cancelledReason: text("cancelledReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  cancelledAt: timestamp("cancelledAt"),
});
export type RecurringOrder = typeof recurringOrders.$inferSelect;
export type InsertRecurringOrder = typeof recurringOrders.$inferInsert;

/**
 * Recurring Order History - История повторяющихся заказов
 * Отслеживание каждого выполненного повторяющегося заказа
 */
export const recurringOrderHistory = mysqlTable("recurringOrderHistory", {
  id: int("id").autoincrement().primaryKey(),
  recurringOrderId: int("recurringOrderId").notNull().references(() => recurringOrders.id, { onDelete: "cascade" }),
  orderNumber: int("orderNumber").notNull(), // порядковый номер заказа
  originalPrice: decimal("originalPrice", { precision: 12, scale: 2 }).notNull(),
  discountedPrice: decimal("discountedPrice", { precision: 12, scale: 2 }).notNull(),
  savings: decimal("savings", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "cancelled", "failed"]).default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RecurringOrderHistory = typeof recurringOrderHistory.$inferSelect;
export type InsertRecurringOrderHistory = typeof recurringOrderHistory.$inferInsert;
