CREATE TABLE `jwt_auth_refresh_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`token_hash` text NOT NULL,
	`family_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`revoked_at` integer,
	`created_at` integer NOT NULL,
	`replaced_by_token_id` text,
	`claims` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jwt_auth_refresh_tokens_token_hash_unique` ON `jwt_auth_refresh_tokens` (`token_hash`);