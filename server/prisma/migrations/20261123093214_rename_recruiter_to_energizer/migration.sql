ALTER TABLE `cards` MODIFY `talent` ENUM('striker', 'guardian', 'recruiter', 'energizer') NULL;
UPDATE `cards` SET `talent` = 'energizer' WHERE `talent` = 'recruiter';
ALTER TABLE `cards` MODIFY `talent` ENUM('striker', 'guardian', 'energizer') NULL;