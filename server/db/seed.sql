-- Les cartes de test du jeu
-- À lancer après schema.sql. Relançable sans danger : les cartes déjà présentes gardent leurs données,
-- seuls la description et l'image sont mises à jour, puis les PV et les attaques des cartes de combat sont réécrits (utile pour une base créée avant ces ajouts).
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
    (11, 'Ça marche sur ma machine', NULL, 'Le bug n''existe pas : c''est ta configuration qui est mauvaise.', 'combat_11.webp', NULL, 'commun', 'battle'),
    (12, 'Café de la machine', NULL, 'Il est brûlant et il a un goût étrange, mais il réveille.', 'combat_12.webp', NULL, 'commun', 'battle'),
    (13, 'Le Wi-Fi de l''école', NULL, 'Il attend que la page charge. Il attendra longtemps.', NULL, NULL, 'uncommun', 'battle'),
    (14, 'Ctrl+Z', NULL, 'Un petit retour en arrière sauve beaucoup de journées.', 'combat_14.webp', NULL, 'uncommun', 'battle'),
    (15, 'Rendu à 23h59', NULL, 'La panique rend très productif.', 'combat_15.webp', NULL, 'rare', 'battle'),
    (16, 'Stack Overflow à la rescousse', NULL, 'La réponse acceptée date de 2014, mais elle marche encore.', NULL, NULL, 'rare', 'battle'),
    (17, 'git push --force', NULL, 'Tes collègues vont avoir des questions.', 'combat_17.webp', NULL, 'epic', 'battle'),
    (18, 'Le merge conflict', NULL, 'Il faut d''abord résoudre le conflit. Bonne chance.', NULL, NULL, 'epic', 'battle'),
    (19, 'rm -rf /', NULL, 'Aucune confirmation demandée, aucun retour en arrière possible.', NULL, NULL, 'legendary', 'battle'),
    (20, 'La semaine des partiels', NULL, 'Cinq examens en cinq jours et une seule nuit de révision.', 'combat_20.webp', NULL, 'legendary', 'battle'),
    (31, 'Maëlys.B', 'Adore le tennis mais elle est nul', NULL, 'carte_étudiante_01.webp', '#2aa9ad', 'uncommun', 'student'),
    (32, 'Théo.B', 'Le roi du style entrepreneur', NULL, 'carte_étudiante_02.webp', '#ffe100', 'rare', 'student'),
    (33, 'Mahé.P', 'Un chien', NULL, 'carte_étudiante_03.webp', '#00e5ff', 'commun', 'student'),
    (34, 'Antoine.A', 'Un canadian Pinguoin', NULL, 'carte_étudiante_04.webp', '#0800ff', 'epic', 'student'),
    (35, 'Julien.V', 'Le roi des girondins', NULL, 'carte_étudiante_05.webp', '#e100ff', 'legendary', 'student')
ON DUPLICATE KEY UPDATE description = VALUES(description), image = VALUES(image);

UPDATE cards SET hp = CASE id
    WHEN 11 THEN 60  WHEN 12 THEN 70
    WHEN 13 THEN 80  WHEN 14 THEN 80
    WHEN 15 THEN 100 WHEN 16 THEN 100
    WHEN 17 THEN 120 WHEN 18 THEN 120
    WHEN 19 THEN 150 WHEN 20 THEN 150
END
WHERE id BETWEEN 11 AND 20;

DELETE FROM card_attacks WHERE card_id BETWEEN 11 AND 20;
INSERT INTO card_attacks (card_id, slot, name, energy_cost, damage, description) VALUES
    (11, 1, 'Aucun bug ici', 1, 20, 'Inflige 20 dégâts. Il n''a jamais vu ce bug.'),
    (11, 2, 'Démo qui plante', 2, 40, 'Inflige 40 dégâts. Ça marchait pourtant ce matin.'),
    (12, 1, 'Jet brûlant', 1, 20, 'Inflige 20 dégâts. Attention, c''est très chaud.'),
    (12, 2, 'Double expresso', 2, 40, 'Inflige 40 dégâts. Il n''a pas dormi non plus.'),
    (13, 1, 'Connexion instable', 1, 25, 'Inflige 25 dégâts. Le chargement n''en finit pas.'),
    (13, 2, 'Coupure en plein rendu', 2, 50, 'Inflige 50 dégâts. Tout est perdu, sans sauvegarde.'),
    (14, 1, 'Annuler', 1, 30, 'Inflige 30 dégâts. Un retour en arrière qui fait mal.'),
    (14, 2, 'Ctrl+Z x 50', 2, 50, 'Inflige 50 dégâts. Plus rien ne reste de la veille.'),
    (15, 1, 'Dernière minute', 2, 50, 'Inflige 50 dégâts. La panique rend très productif.'),
    (15, 2, 'Commit sans relire', 3, 75, 'Inflige 75 dégâts. Pas le temps de tester.'),
    (16, 1, 'Copier-coller', 1, 30, 'Inflige 30 dégâts. Sans lire la réponse.'),
    (16, 2, 'Réponse de 2014', 3, 70, 'Inflige 70 dégâts. Elle marche encore, étonnamment.'),
    (17, 1, 'git push --force', 3, 80, 'Inflige 80 dégâts. Tes collègues vont avoir des questions.'),
    (17, 2, 'Merge de la dernière chance', 2, 40, 'Inflige 40 dégâts. Tout est vert… presque.'),
    (18, 1, '<<<<<<< HEAD', 2, 45, 'Inflige 45 dégâts. Il faut tout relire à la main.'),
    (18, 2, 'Conflit sur 42 fichiers', 3, 80, 'Inflige 80 dégâts. Personne ne sait lequel garder.'),
    (19, 1, 'sudo', 2, 70, 'Inflige 70 dégâts. Plus aucune permission demandée.'),
    (19, 2, 'rm -rf /', 3, 120, 'Inflige 120 dégâts. Aucun retour en arrière possible.'),
    (20, 1, 'Révisions de la veille', 2, 70, 'Inflige 70 dégâts. Tout le cours en une seule nuit.'),
    (20, 2, 'Les partiels', 3, 110, 'Inflige 110 dégâts. Cinq examens en cinq jours.');
