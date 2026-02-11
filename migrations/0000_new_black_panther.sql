CREATE TABLE `admin_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`type` text NOT NULL,
	`related_id` integer,
	`read` integer DEFAULT 0,
	`created_at` text DEFAULT '2026-02-11T15:02:09.274Z'
);
--> statement-breakpoint
CREATE TABLE `admins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'admin',
	`created_at` text DEFAULT '2026-02-11T15:02:09.272Z'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_unique` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`datetime` text NOT NULL,
	`status` text NOT NULL,
	`notes` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ebooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pathology_id` integer,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`cover_url` text NOT NULL,
	`download_url` text NOT NULL,
	`tags` text NOT NULL,
	`pages` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`created_at` text DEFAULT '2026-02-11T15:02:09.267Z'
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`type` text NOT NULL,
	`read` integer DEFAULT 0,
	`created_at` text DEFAULT '2026-02-11T15:02:09.274Z'
);
--> statement-breakpoint
CREATE TABLE `pathologies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`image_url` text,
	`price` integer DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pathologies_slug_unique` ON `pathologies` (`slug`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`plan` text NOT NULL,
	`status` text NOT NULL,
	`start_date` text NOT NULL,
	`renewal_date` text NOT NULL,
	`payment_method` text NOT NULL,
	`proof_url` text
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_name` text DEFAULT 'Doce Leveza',
	`support_email` text DEFAULT 'suporte@doceleveza.com',
	`support_phone` text DEFAULT '(11) 99999-9999',
	`maintenance_mode` integer DEFAULT 0,
	`enable_signup` integer DEFAULT 1,
	`api_base_url` text,
	`google_analytics_id` text,
	`facebook_pixel_id` text,
	`smtp_host` text,
	`smtp_port` integer,
	`smtp_user` text,
	`smtp_pass` text
);
--> statement-breakpoint
CREATE TABLE `user_access` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`pathology_id` integer NOT NULL,
	`start_date` text NOT NULL,
	`expiry_date` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`password` text NOT NULL,
	`created_at` text DEFAULT '2026-02-11T15:02:09.271Z'
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pathology_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`duration` text NOT NULL,
	`thumbnail_url` text NOT NULL,
	`video_url` text NOT NULL,
	`resources` text,
	`view_count` integer DEFAULT 0
);
