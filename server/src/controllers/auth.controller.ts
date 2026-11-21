import type { Request, Response } from 'express'
import { HttpError } from '../errors/HttpError.js'
import { authService } from '../services/auth.service.js'
import { normalizeEmail, PASSWORD_REGEX, PASSWORD_RULES_MESSAGE } from '../services/authValidation.js'
import { containsForbiddenWord } from '../services/wordFilter.js'

export const authController = {
    async register(req: Request, res: Response) {
        const { email: rawEmail, password, username: rawUsername } = req.body ?? {}

        if (!rawEmail) throw new HttpError(400, 'Email requis')
        if (!password) throw new HttpError(400, 'Mot de passe requis')
        if (!rawUsername) throw new HttpError(400, 'Pseudo requis')

        const email = normalizeEmail(rawEmail)
        const username = rawUsername.trim()

        if (!username) throw new HttpError(400, 'Pseudo requis')
        if (containsForbiddenWord(username)) throw new HttpError(400, 'Ce pseudo contient un mot interdit')
        if (!PASSWORD_REGEX.test(password)) throw new HttpError(400, PASSWORD_RULES_MESSAGE)

        res.status(201).json(await authService.register(email, password, username))
    },

    async login(req: Request, res: Response) {
        const { email: rawEmail, password } = req.body ?? {}

        if (!rawEmail || !password) throw new HttpError(400, 'Email et mot de passe requis')

        res.json(await authService.login(normalizeEmail(rawEmail), password))
    },

    async profile(_req: Request, res: Response) {
        res.json({ user: await authService.getProfile(res.locals.userId) })
    },
}
