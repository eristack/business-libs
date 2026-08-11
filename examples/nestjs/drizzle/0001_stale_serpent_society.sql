CREATE TABLE `jwt_auth_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`disabled_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jwt_auth_credentials_subject_unique` ON `jwt_auth_credentials` (`subject`);--> statement-breakpoint
CREATE UNIQUE INDEX `jwt_auth_credentials_username_unique` ON `jwt_auth_credentials` (`username`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`created_at` integer NOT NULL
);
