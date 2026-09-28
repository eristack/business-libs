CREATE TABLE `idempotency_records` (
	`storage_key` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`request_hash` text NOT NULL,
	`response_json` text,
	`error_message` text,
	`lease_expires_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idempotency_records_key_uq` ON `idempotency_records` (`storage_key`);--> statement-breakpoint
ALTER TABLE `orders` ADD `idempotency_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_idempotency_key_uq` ON `orders` (`idempotency_key`);
