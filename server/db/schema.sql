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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Toutes les cartes du jeu
CREATE TABLE IF NOT EXISTS cards (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subtitle VARCHAR(255) NULL,
    description VARCHAR(500) NULL,
    image VARCHAR(255) NULL,
    color VARCHAR(7) NULL,
    rarity ENUM('commun', 'uncommun', 'rare', 'epic', 'legendary') NOT NULL,
    type ENUM('collection', 'battle', 'student') NOT NULL
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
