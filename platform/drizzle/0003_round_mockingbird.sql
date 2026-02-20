CREATE TABLE `pushConsent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consentGiven` boolean NOT NULL DEFAULT false,
	`consentDate` timestamp,
	`consentVersion` varchar(10) NOT NULL DEFAULT '1.0',
	`ipAddress` varchar(45),
	`userAgent` text,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pushConsent_id` PRIMARY KEY(`id`),
	CONSTRAINT `pushConsent_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `pushNotificationLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationType` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text,
	`platform` enum('ios','android','web'),
	`status` enum('sent','delivered','failed') NOT NULL DEFAULT 'sent',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pushNotificationLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pushToken` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` text NOT NULL,
	`platform` enum('ios','android','web') NOT NULL,
	`deviceName` varchar(255),
	`osVersion` varchar(50),
	`appVersion` varchar(50),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `pushToken_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `pushConsent` ADD CONSTRAINT `pushConsent_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pushNotificationLog` ADD CONSTRAINT `pushNotificationLog_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pushToken` ADD CONSTRAINT `pushToken_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;