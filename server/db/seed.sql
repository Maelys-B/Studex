-- Les cartes de test (copiées de src/features/boosters/data/cards_test.ts)
-- À lancer après schema.sql
USE studex;

INSERT IGNORE INTO cards (id, name, subtitle, image, color, rarity, type) VALUES
    (1, 'Mon ordi qui rame', NULL, NULL, NULL, 'commun', 'collection'),
    (2, 'Le café tiède', NULL, NULL, NULL, 'commun', 'collection'),
    (3, 'La salle 204 sans prise', NULL, NULL, NULL, 'uncommun', 'collection'),
    (4, 'Le TP de 8h', NULL, NULL, NULL, 'uncommun', 'collection'),
    (5, 'Le groupe de projet fantôme', NULL, NULL, NULL, 'rare', 'collection'),
    (6, 'La cafèt'' en fin de mois', NULL, NULL, NULL, 'rare', 'collection'),
    (7, 'Le prof qui a oublié le micro', NULL, NULL, NULL, 'epic', 'collection'),
    (8, 'La nuit blanche avant le rendu', NULL, NULL, NULL, 'epic', 'collection'),
    (9, 'Le 20/20 mythique', NULL, NULL, NULL, 'legendary', 'collection'),
    (10, 'Le diplôme en poche', NULL, NULL, NULL, 'legendary', 'collection'),
    (11, 'Ça marche sur ma machine', NULL, NULL, NULL, 'commun', 'battle'),
    (12, 'Café de la machine', NULL, NULL, NULL, 'commun', 'battle'),
    (13, 'Le Wi-Fi de l''école', NULL, NULL, NULL, 'uncommun', 'battle'),
    (14, 'Ctrl+Z', NULL, NULL, NULL, 'uncommun', 'battle'),
    (15, 'Rendu à 23h59', NULL, NULL, NULL, 'rare', 'battle'),
    (16, 'Stack Overflow à la rescousse', NULL, NULL, NULL, 'rare', 'battle'),
    (17, 'git push --force', NULL, NULL, NULL, 'epic', 'battle'),
    (18, 'Le merge conflict', NULL, NULL, NULL, 'epic', 'battle'),
    (19, 'rm -rf /', NULL, NULL, NULL, 'legendary', 'battle'),
    (20, 'Le serveur en prod un vendredi', NULL, NULL, NULL, 'legendary', 'battle'),
    (31, 'Maëlys.B', 'Adore le tennis mais elle est nul', 'carte_étudiante_01.png', '#2aa9ad', 'uncommun', 'student'),
    (32, 'Théo.B', 'Le roi du style entrepreneur', 'carte_étudiante_02.png', '#ffe100', 'rare', 'student'),
    (33, 'Mahé.P', 'Un chien', 'carte_étudiante_03.png', '#00e5ff', 'commun', 'student'),
    (34, 'Antoine.A', 'Un canadian Pinguoin', 'carte_étudiante_04.png', '#0800ff', 'epic', 'student'),
    (35, 'Julien.V', 'Le roi des girondins', 'carte_étudiante_05.png', '#e100ff', 'legendary', 'student');
