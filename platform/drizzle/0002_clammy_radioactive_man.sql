CREATE TABLE `referralBonuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralId` int NOT NULL,
	`referrerId` int NOT NULL,
	`referredId` int NOT NULL,
	`orderId` int,
	`commissionAmount` int NOT NULL,
	`bonusAmount` int NOT NULL,
	`bonusPercentage` int NOT NULL,
	`status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralBonuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referralPayouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`totalAmount` int NOT NULL,
	`bonusCount` int NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`transactionId` varchar(255),
	`failureReason` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralPayouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referralStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`totalReferrals` int NOT NULL DEFAULT 0,
	`activeReferrals` int NOT NULL DEFAULT 0,
	`totalBonusEarned` int NOT NULL DEFAULT 0,
	`totalBonusPaid` int NOT NULL DEFAULT 0,
	`totalBonusPending` int NOT NULL DEFAULT 0,
	`averageBonusPerReferral` int NOT NULL DEFAULT 0,
	`lastPayoutDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralStats_id` PRIMARY KEY(`id`),
	CONSTRAINT `referralStats_referrerId_unique` UNIQUE(`referrerId`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredId` int NOT NULL,
	`referralCode` varchar(32) NOT NULL,
	`status` enum('pending','active','inactive') NOT NULL DEFAULT 'pending',
	`bonusPercentage` int NOT NULL DEFAULT 10,
	`totalEarned` int NOT NULL DEFAULT 0,
	`totalCommission` int NOT NULL DEFAULT 0,
	`activatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
ALTER TABLE `referralBonuses` ADD CONSTRAINT `referralBonuses_referralId_referrals_id_fk` FOREIGN KEY (`referralId`) REFERENCES `referrals`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referralBonuses` ADD CONSTRAINT `referralBonuses_referrerId_users_id_fk` FOREIGN KEY (`referrerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referralBonuses` ADD CONSTRAINT `referralBonuses_referredId_users_id_fk` FOREIGN KEY (`referredId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referralPayouts` ADD CONSTRAINT `referralPayouts_referrerId_users_id_fk` FOREIGN KEY (`referrerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referralStats` ADD CONSTRAINT `referralStats_referrerId_users_id_fk` FOREIGN KEY (`referrerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrerId_users_id_fk` FOREIGN KEY (`referrerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referredId_users_id_fk` FOREIGN KEY (`referredId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;