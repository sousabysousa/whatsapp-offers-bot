CREATE TABLE `groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`session_id` int NOT NULL,
	`group_name` varchar(255) NOT NULL,
	`group_id` varchar(255) NOT NULL,
	`description` text,
	`participant_count` int DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`offer_id` int NOT NULL,
	`group_id` int NOT NULL,
	`status` enum('sent','failed','pending') NOT NULL DEFAULT 'pending',
	`error_message` text,
	`sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`product_id` int NOT NULL,
	`scheduled_at` timestamp NOT NULL,
	`status` enum('pending','sent','failed','cancelled') NOT NULL DEFAULT 'pending',
	`group_ids` json NOT NULL,
	`sent_count` int DEFAULT 0,
	`failed_count` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`product_link` varchar(2048),
	`image_url` varchar(2048),
	`price` decimal(10,2),
	`emoji` varchar(10) DEFAULT '🔥',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`session_name` varchar(255) NOT NULL,
	`status` enum('disconnected','connecting','connected','error') NOT NULL DEFAULT 'disconnected',
	`qr_code` text,
	`phone_number` varchar(20),
	`last_connected` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsapp_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `whatsapp_sessions_session_name_unique` UNIQUE(`session_name`)
);
--> statement-breakpoint
ALTER TABLE `groups` ADD CONSTRAINT `groups_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groups` ADD CONSTRAINT `groups_session_id_whatsapp_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `whatsapp_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `message_history` ADD CONSTRAINT `message_history_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `message_history` ADD CONSTRAINT `message_history_offer_id_offers_id_fk` FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `message_history` ADD CONSTRAINT `message_history_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `offers` ADD CONSTRAINT `offers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `offers` ADD CONSTRAINT `offers_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `whatsapp_sessions` ADD CONSTRAINT `whatsapp_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;