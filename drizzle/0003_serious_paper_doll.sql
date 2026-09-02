CREATE TABLE `entitlements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`plan_id` text NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `entitlements_user_status_idx` ON `entitlements` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `entitlements_email_idx` ON `entitlements` (`email`);--> statement-breakpoint
CREATE TABLE `payment_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text DEFAULT 'mercado_pago' NOT NULL,
	`provider_event_id` text NOT NULL,
	`event_type` text NOT NULL,
	`resource_id` text,
	`processing_status` text DEFAULT 'received' NOT NULL,
	`payload` text NOT NULL,
	`error_message` text,
	`received_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`processed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_events_provider_event_id_unique` ON `payment_events` (`provider_event_id`);--> statement-breakpoint
CREATE INDEX `payment_events_status_received_idx` ON `payment_events` (`processing_status`,`received_at`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`plan_id` text NOT NULL,
	`subscription_id` integer,
	`provider` text DEFAULT 'mercado_pago' NOT NULL,
	`provider_payment_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text,
	`installments` integer DEFAULT 1 NOT NULL,
	`gross_amount_cents` integer NOT NULL,
	`fee_amount_cents` integer DEFAULT 0 NOT NULL,
	`net_amount_cents` integer DEFAULT 0 NOT NULL,
	`approved_at` text,
	`available_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_provider_payment_id_unique` ON `payments` (`provider_payment_id`);--> statement-breakpoint
CREATE INDEX `payments_status_created_idx` ON `payments` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `payments_user_idx` ON `payments` (`user_id`);--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`billing_type` text NOT NULL,
	`duration_days` integer,
	`price_cents` integer NOT NULL,
	`max_installments` integer DEFAULT 1 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plans_slug_unique` ON `plans` (`slug`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`plan_id` text NOT NULL,
	`provider` text DEFAULT 'mercado_pago' NOT NULL,
	`provider_subscription_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`starts_at` text,
	`current_period_end` text,
	`next_charge_at` text,
	`cancelled_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_provider_subscription_id_unique` ON `subscriptions` (`provider_subscription_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_status_idx` ON `subscriptions` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `subscriptions_email_idx` ON `subscriptions` (`email`);
