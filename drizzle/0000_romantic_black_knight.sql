CREATE TABLE `pilot_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`status` text NOT NULL,
	`consent_version` text DEFAULT '2026-08' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pilot_leads_email_unique` ON `pilot_leads` (`email`);