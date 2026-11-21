import type { Request, Response } from 'express'
import { HttpError } from '../errors/HttpError.js'
import { profileService } from '../services/profile.service.js'
import { normalizeEmail, PASSWORD_REGEX, PASSWORD_RULES_MESSAGE } from '../services/authValidation.js'

export const profileController = {
    async update(req: Request, res: Response) {
        const { email: rawEmail, username: rawUsername } = req.body ?? {}

        if (!rawEmail || !rawUsername) throw new HttpError(400, 'Pseudo ou Email requis')

        const email = normalizeEmail(rawEmail)
        const username = rawUsername.trim()

        if (!username) throw new HttpError(400, 'Pseudo requis')

        res.json({ user: await profileService.update(res.locals.userId, email, username) })
    },

    async changePassword(req: Request, res: Response) {
        const { oldPassword, newPassword } = req.body ?? {}

        if (!oldPassword || !newPassword) {
            throw new HttpError(400, 'Veuillez renseigner les deux mots de passes')
        }
        if (!PASSWORD_REGEX.test(newPassword)) throw new HttpError(400, PASSWORD_RULES_MESSAGE)

        await profileService.changePassword(res.locals.userId, oldPassword, newPassword)
        res.json({ message: 'Changement effectué' })
    },
}
