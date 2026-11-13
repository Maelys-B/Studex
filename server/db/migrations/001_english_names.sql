USE studex;

ALTER TABLE users
    CHANGE COLUMN pseudo username VARCHAR(50) NOT NULL,
    CHANGE COLUMN mdp password VARCHAR(255) NOT NULL;

ALTER TABLE cards
    MODIFY rarity ENUM('commun', 'uncommun', 'common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL;
UPDATE cards SET rarity = 'common' WHERE rarity = 'commun';
UPDATE cards SET rarity = 'uncommon' WHERE rarity = 'uncommun';
ALTER TABLE cards
    MODIFY rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL;

UPDATE cards SET image = REPLACE(image, 'combat_', 'battle_') WHERE image LIKE 'combat\_%';
UPDATE cards SET image = REPLACE(image, 'carte_étudiante_', 'student_') WHERE image LIKE 'carte\_étudiante\_%';
