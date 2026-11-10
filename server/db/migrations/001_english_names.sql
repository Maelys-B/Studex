-- Renames French column names and values to English on an existing database
-- Run once, before seed.sql, on a database created with the old schema.sql
USE studex;

ALTER TABLE users
    CHANGE COLUMN pseudo username VARCHAR(50) NOT NULL,
    CHANGE COLUMN mdp password VARCHAR(255) NOT NULL;

-- Temporarily allow both spellings so the existing rows can be converted
ALTER TABLE cards
    MODIFY rarity ENUM('commun', 'uncommun', 'common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL;
UPDATE cards SET rarity = 'common' WHERE rarity = 'commun';
UPDATE cards SET rarity = 'uncommon' WHERE rarity = 'uncommun';
ALTER TABLE cards
    MODIFY rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL;

UPDATE cards SET image = REPLACE(image, 'combat_', 'battle_') WHERE image LIKE 'combat\_%';
UPDATE cards SET image = REPLACE(image, 'carte_étudiante_', 'student_') WHERE image LIKE 'carte\_étudiante\_%';
