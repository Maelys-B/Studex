-- Les cartes de test du jeu
-- À lancer après schema.sql. Relançable sans danger : les cartes déjà présentes gardent leurs données,
-- seuls la description et l'image sont mises à jour (utile pour une base créée avant ces ajouts).
USE studex;

INSERT INTO cards (id, name, subtitle, description, image, color, rarity, type) VALUES
    (1, 'Mon ordi qui rame', NULL, 'Il met 3 plombes à s''allumer, les fenêtres tournent en boucle et tu poses ta souris 10 fois avant qu''il réagisse.', 'collection_01.webp', NULL, 'commun', 'collection'),
    (2, 'Le café tiède', NULL, 'Tu l''as posé « deux minutes » sur le bureau. Il est maintenant à température ambiante et tu le bois quand même.', NULL, NULL, 'commun', 'collection'),
    (3, 'La salle 204 sans prise', NULL, 'Trente étudiants, une seule multiprise et un portable à 3 %. Celui qui arrive en retard code sur ses genoux.', 'collection_03.webp', NULL, 'uncommun', 'collection'),
    (4, 'Le TP de 8h', NULL, 'Le prof est là, le café aussi, mais ton cerveau est encore dans ton lit. Tu rends un compte rendu à moitié rêvé.', NULL, NULL, 'uncommun', 'collection'),
    (5, 'Le groupe de projet fantôme', NULL, 'Quatre noms sur le rendu, un seul qui a travaillé. Les trois autres « avaient prévu de s''y mettre ».', 'collection_05.webp', NULL, 'rare', 'collection'),
    (6, 'La cafèt'' en fin de mois', NULL, 'Le menu du jour, ce sont des pâtes. Encore. Tu comptes tes pièces pour savoir si tu peux te payer la compote.', NULL, NULL, 'rare', 'collection'),
    (7, 'Le prof qui a oublié le micro', NULL, 'Il parle très bas depuis 20 minutes, personne n''ose lui dire, et le fond de la salle a abandonné depuis longtemps.', 'collection_07.webp', NULL, 'epic', 'collection'),
    (8, 'La nuit blanche avant le rendu', NULL, 'À 3h du matin tu écris la conclusion. À 7h tu relis. À 8h tu rends. À 9h tu te demandes ce que tu as écrit.', NULL, NULL, 'epic', 'collection'),
    (9, 'Le 20/20 mythique', NULL, 'On en parle dans les couloirs, personne n''en a jamais vu un. Certains disent qu''il existe en maths. Peut-être.', NULL, NULL, 'legendary', 'collection'),
    (10, 'Le diplôme en poche', NULL, 'Cinq ans de cafés tièdes et de nuits blanches pour un papier. Il est enfin dans ta poche, et tu ne sais plus où tu l''as rangé.', 'collection_10.webp', NULL, 'legendary', 'collection'),
    (11, 'Ça marche sur ma machine', NULL, 'Annule la dernière attaque de l''adversaire. Le bug n''a jamais existé : c''est lui qui a mal configuré.', NULL, NULL, 'commun', 'battle'),
    (12, 'Café de la machine', NULL, 'Soigne 20 PV. Il est brûlant, il a un goût étrange, mais il remet d''aplomb.', NULL, NULL, 'commun', 'battle'),
    (13, 'Le Wi-Fi de l''école', NULL, '50 % de chances que l''adversaire passe son tour. Il attend que la page charge.', NULL, NULL, 'uncommun', 'battle'),
    (14, 'Ctrl+Z', NULL, 'Ramène ta dernière carte défaussée dans ta main. Un petit retour en arrière sauve beaucoup de journées.', NULL, NULL, 'uncommun', 'battle'),
    (15, 'Rendu à 23h59', NULL, 'Dégâts doublés quand tes PV sont sous 30 %. La panique rend très productif.', NULL, NULL, 'rare', 'battle'),
    (16, 'Stack Overflow à la rescousse', NULL, 'Soigne 15 PV. La réponse acceptée date de 2014, mais elle marche encore.', NULL, NULL, 'rare', 'battle'),
    (17, 'git push --force', NULL, 'Inflige de gros dégâts, mais tu défausses une carte. Tes collègues vont avoir des questions.', NULL, NULL, 'epic', 'battle'),
    (18, 'Le merge conflict', NULL, 'L''adversaire perd 10 PV et ne peut pas attaquer au prochain tour : il doit d''abord résoudre le conflit.', NULL, NULL, 'epic', 'battle'),
    (19, 'rm -rf /', NULL, 'Détruit la carte active de l''adversaire. Aucune confirmation demandée, aucun retour en arrière possible.', NULL, NULL, 'legendary', 'battle'),
    (20, 'Le serveur en prod un vendredi', NULL, 'Inflige des dégâts énormes, mais tu perds 20 PV. Déployer un vendredi, c''est toujours une excellente idée.', NULL, NULL, 'legendary', 'battle'),
    (31, 'Maëlys.B', 'Adore le tennis mais elle est nul', NULL, 'carte_étudiante_01.webp', '#2aa9ad', 'uncommun', 'student'),
    (32, 'Théo.B', 'Le roi du style entrepreneur', NULL, 'carte_étudiante_02.webp', '#ffe100', 'rare', 'student'),
    (33, 'Mahé.P', 'Un chien', NULL, 'carte_étudiante_03.webp', '#00e5ff', 'commun', 'student'),
    (34, 'Antoine.A', 'Un canadian Pinguoin', NULL, 'carte_étudiante_04.webp', '#0800ff', 'epic', 'student'),
    (35, 'Julien.V', 'Le roi des girondins', NULL, 'carte_étudiante_05.webp', '#e100ff', 'legendary', 'student')
ON DUPLICATE KEY UPDATE description = VALUES(description), image = VALUES(image);
