CREATE TABLE `escrowTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`clientId` int NOT NULL,
	`executorId` int NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','held','released','refunded','disputed') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50) NOT NULL,
	`paymentId` varchar(255),
	`releaseDate` timestamp,
	`disputeReason` text,
	`arbitrationResult` enum('client_win','executor_win','split'),
	`arbitrationNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `escrowTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insuranceClaims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`insurancePlanId` int NOT NULL,
	`jobId` int NOT NULL,
	`claimReason` text NOT NULL,
	`claimAmount` int NOT NULL,
	`status` enum('pending','approved','rejected','paid') NOT NULL DEFAULT 'pending',
	`evidence` text,
	`approvalDate` timestamp,
	`paymentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insuranceClaims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insurancePlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planType` enum('executor_protection','client_protection','both') NOT NULL,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	`monthlyPrice` int NOT NULL,
	`coverageAmount` int NOT NULL,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`autoRenewal` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insurancePlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceIntegrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`marketplace` enum('yandex_rabota','headhunter','avito') NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`status` enum('connected','disconnected','error') NOT NULL DEFAULT 'connected',
	`lastSyncAt` timestamp,
	`syncErrorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceIntegrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceListings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`marketplace` enum('yandex_rabota','headhunter','avito') NOT NULL,
	`externalJobId` varchar(255) NOT NULL,
	`status` enum('published','archived','error') NOT NULL DEFAULT 'published',
	`viewCount` int DEFAULT 0,
	`applicationCount` int DEFAULT 0,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceListings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videoInterviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`clientId` int NOT NULL,
	`executorId` int NOT NULL,
	`status` enum('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`scheduledAt` timestamp,
	`startedAt` timestamp,
	`endedAt` timestamp,
	`recordingUrl` varchar(500),
	`recordingDuration` int,
	`clientConsent` boolean NOT NULL DEFAULT false,
	`executorConsent` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videoInterviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `escrowTransactions` ADD CONSTRAINT `escrowTransactions_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escrowTransactions` ADD CONSTRAINT `escrowTransactions_clientId_users_id_fk` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escrowTransactions` ADD CONSTRAINT `escrowTransactions_executorId_users_id_fk` FOREIGN KEY (`executorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `insuranceClaims` ADD CONSTRAINT `insuranceClaims_insurancePlanId_insurancePlans_id_fk` FOREIGN KEY (`insurancePlanId`) REFERENCES `insurancePlans`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `insuranceClaims` ADD CONSTRAINT `insuranceClaims_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `insurancePlans` ADD CONSTRAINT `insurancePlans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceIntegrations` ADD CONSTRAINT `marketplaceIntegrations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceListings` ADD CONSTRAINT `marketplaceListings_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videoInterviews` ADD CONSTRAINT `videoInterviews_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videoInterviews` ADD CONSTRAINT `videoInterviews_clientId_users_id_fk` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videoInterviews` ADD CONSTRAINT `videoInterviews_executorId_users_id_fk` FOREIGN KEY (`executorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;