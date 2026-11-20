-- CreateTable
CREATE TABLE `card_attacks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `card_id` INTEGER NOT NULL,
    `slot` TINYINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `kind` ENUM('attack', 'defense') NOT NULL DEFAULT 'attack',
    `energy_cost` TINYINT NOT NULL,
    `damage` INTEGER NOT NULL,
    `description` VARCHAR(255) NULL,

    UNIQUE INDEX `uniq_card_slot`(`card_id`, `slot`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `position_collection` INTEGER NOT NULL DEFAULT 0,
    `subtitle` VARCHAR(255) NULL,
    `description` VARCHAR(500) NULL,
    `image` VARCHAR(255) NULL,
    `hp` INTEGER NULL,
    `color` VARCHAR(7) NULL,
    `rarity` ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL,
    `type` ENUM('collection', 'battle', 'student') NOT NULL,
    `created_by` INTEGER NULL,
    `avatar` JSON NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',

    UNIQUE INDEX `created_by`(`created_by`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `friendships` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requester_id` INTEGER NOT NULL,
    `addressee_id` INTEGER NOT NULL,
    `status` ENUM('pending', 'accepted') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `user_low` INTEGER GENERATED ALWAYS AS (LEAST(`requester_id`, `addressee_id`)) VIRTUAL,
    `user_high` INTEGER GENERATED ALWAYS AS (GREATEST(`requester_id`, `addressee_id`)) VIRTUAL,

    INDEX `addressee_id`(`addressee_id`),
    INDEX `requester_id`(`requester_id`),
    UNIQUE INDEX `uniq_pair`(`user_low`, `user_high`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reporter_id` INTEGER NOT NULL,
    `reported_user_id` INTEGER NULL,
    `card_id` INTEGER NULL,
    `reason` ENUM('inappropriate', 'offensive', 'harassment', 'impersonation', 'spam', 'other') NOT NULL,
    `message` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `card_id`(`card_id`),
    INDEX `reported_user_id`(`reported_user_id`),
    UNIQUE INDEX `uniq_repoter_card`(`reporter_id`, `card_id`),
    UNIQUE INDEX `uniq_repoter_user`(`reporter_id`, `reported_user_id`),
    PRIMARY KEY (`id`),
    -- Ajouté à la main : Prisma ne gère pas les contraintes CHECK
    CONSTRAINT `one_target` CHECK ((`reported_user_id` IS NULL) <> (`card_id` IS NULL))
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_boosters` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `stored_booster` INTEGER NOT NULL,
    `last_gained_at` BIGINT NOT NULL,

    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_cards` (
    `user_id` INTEGER NOT NULL,
    `card_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `obtained_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `card_id`(`card_id`),
    PRIMARY KEY (`user_id`, `card_id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `card_attacks` ADD CONSTRAINT `card_attacks_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cards` ADD CONSTRAINT `fk_cards_user` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `friendships` ADD CONSTRAINT `friendships_ibfk_1` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `friendships` ADD CONSTRAINT `friendships_ibfk_2` FOREIGN KEY (`addressee_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_ibfk_3` FOREIGN KEY (`reported_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_cards` ADD CONSTRAINT `user_cards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_cards` ADD CONSTRAINT `user_cards_ibfk_2` FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
