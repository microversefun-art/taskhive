CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`points` int DEFAULT 0,
	`badge` enum('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobId` int NOT NULL,
	`type` enum('executor','client') NOT NULL,
	`score` decimal(5,2) NOT NULL DEFAULT '0.00',
	`reason` text,
	`clicked` boolean NOT NULL DEFAULT false,
	`applied` boolean NOT NULL DEFAULT false,
	`clickedAt` timestamp,
	`appliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurringOrderHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recurringOrderId` int NOT NULL,
	`orderNumber` int NOT NULL,
	`originalPrice` decimal(12,2) NOT NULL,
	`discountedPrice` decimal(12,2) NOT NULL,
	`savings` decimal(12,2) NOT NULL,
	`status` enum('pending','completed','cancelled','failed') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recurringOrderHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurringOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`executorId` int NOT NULL,
	`jobId` int NOT NULL,
	`frequency` enum('daily','weekly','biweekly','monthly') NOT NULL,
	`discount` int NOT NULL DEFAULT 10,
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`totalOrders` int NOT NULL DEFAULT 0,
	`totalSavings` decimal(12,2) NOT NULL DEFAULT '0.00',
	`nextOrderDate` timestamp,
	`cancelledReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`cancelledAt` timestamp,
	CONSTRAINT `recurringOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userInteractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobId` int NOT NULL,
	`action` enum('view','apply','save','complete','reject') NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userInteractions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userLevels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`experience` int NOT NULL DEFAULT 0,
	`totalPoints` int NOT NULL DEFAULT 0,
	`totalAchievements` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userLevels_id` PRIMARY KEY(`id`),
	CONSTRAINT `userLevels_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recommendations` ADD CONSTRAINT `recommendations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recommendations` ADD CONSTRAINT `recommendations_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurringOrderHistory` ADD CONSTRAINT `recurringOrderHistory_recurringOrderId_recurringOrders_id_fk` FOREIGN KEY (`recurringOrderId`) REFERENCES `recurringOrders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurringOrders` ADD CONSTRAINT `recurringOrders_clientId_users_id_fk` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurringOrders` ADD CONSTRAINT `recurringOrders_executorId_users_id_fk` FOREIGN KEY (`executorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurringOrders` ADD CONSTRAINT `recurringOrders_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userInteractions` ADD CONSTRAINT `userInteractions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userInteractions` ADD CONSTRAINT `userInteractions_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userLevels` ADD CONSTRAINT `userLevels_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;