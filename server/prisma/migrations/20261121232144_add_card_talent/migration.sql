-- AlterTable
ALTER TABLE `cards` ADD COLUMN `talent` ENUM('striker', 'guardian', 'recruiter') NULL;
UPDATE `cards`
SET `talent` = ELT(MOD(`id`, 3) + 1, 'striker', 'guardian', 'recruiter')
WHERE `type` = 'student';

