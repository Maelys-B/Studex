-- Création de la base et des tables de Studex
-- À lancer une fois dans phpMyAdmin (onglet SQL) ou avec : mysql -u root < db/schema.sql

CREATE DATABASE IF NOT EXISTS studex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studex;

-- Les joueurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mdp VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Toutes les cartes du jeu
-- created_by : joueur qui a créé sa carte étudiante (NULL pour les cartes du seed), une seule carte par joueur
-- avatar : choix de personnalisation de l avatar en JSON
-- status : une carte créée par un joueur reste pending tant qu un admin ne l a pas validée
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

-- Les 2 attaques de chaque carte de combat (slot = 1 ou 2)
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

-- Qui possède quelle carte, et en combien d'exemplaires
CREATE TABLE IF NOT EXISTS user_cards (
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, card_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id)
) ENGINE=InnoDB;

-- Le stock de boosters de chaque joueur (max 5, 1 gagné toutes les 2 h)
-- last_gained_at : date en millisecondes du dernier booster gagné
-- user_id sans clé étrangère pour l instant : l authentification serveur n est pas encore branchée
CREATE TABLE IF NOT EXISTS user_boosters (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    stored_booster INT NOT NULL,
    last_gained_at BIGINT NOT NULL
) ENGINE=InnoDB;
