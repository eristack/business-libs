CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`status` text NOT NULL,
	`ordered_at` text NOT NULL,
	`total` text NOT NULL
);
