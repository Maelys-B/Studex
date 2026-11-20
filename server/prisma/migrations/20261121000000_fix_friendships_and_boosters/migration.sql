-- friendships : user_low / user_high passent de colonnes générées par MySQL
-- à des colonnes normales remplies par le code (Prisma ne gère pas les colonnes générées)
ALTER TABLE `friendships` DROP INDEX `uniq_pair`, DROP COLUMN `user_low`, DROP COLUMN `user_high`;
ALTER TABLE `friendships` ADD COLUMN `user_low` INTEGER NOT NULL DEFAULT 0, ADD COLUMN `user_high` INTEGER NOT NULL DEFAULT 0;
UPDATE `friendships` SET `user_low` = LEAST(`requester_id`, `addressee_id`), `user_high` = GREATEST(`requester_id`, `addressee_id`);
ALTER TABLE `friendships` ALTER `user_low` DROP DEFAULT, ALTER `user_high` DROP DEFAULT;
ALTER TABLE `friendships` ADD UNIQUE INDEX `uniq_pair`(`user_low`, `user_high`);

-- user_boosters : même type que users.id et vraie clé étrangère
-- (les lignes sans joueur correspondant sont des restes de l'ancien en-tête x-user-id)
DELETE FROM `user_boosters` WHERE `user_id` NOT IN (SELECT `id` FROM `users`);
ALTER TABLE `user_boosters` MODIFY `user_id` INTEGER NOT NULL;
ALTER TABLE `user_boosters` ADD CONSTRAINT `user_boosters_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
