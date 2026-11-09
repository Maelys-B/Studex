CREATE DATABASE IF NOT EXISTS studex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studex;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mdp VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position_collection INT NOT NULL DEFAULT 0,
    subtitle VARCHAR(255) NULL,
    description VARCHAR(500) NULL,
    image VARCHAR(255) NULL,
    hp INT NULL,
    color VARCHAR(7) NULL,
    rarity ENUM('commun', 'uncommun', 'rare', 'epic', 'legendary') NOT NULL,
    type ENUM('collection', 'battle', 'student') NOT NULL,
    created_by INT NULL UNIQUE,
    avatar JSON NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS card_attacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT NOT NULL,
    slot TINYINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    energy_cost TINYINT NOT NULL,
    damage INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    UNIQUE KEY uniq_card_slot (card_id, slot),
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_cards (
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, card_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_boosters (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    stored_booster INT NOT NULL,
    last_gained_at BIGINT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    addressee_id INT NOT NULL,
    status ENUM('pending', 'accepted') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_low INT AS (LEAST(requester_id, addressee_id)) VIRTUAL,
    user_high INT AS (GREATEST(requester_id, addressee_id)) VIRTUAL,
    UNIQUE KEY uniq_pair (user_low, user_high),
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
