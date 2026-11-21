import type { Request, Response } from 'express'
import type { ReportReason } from '../generated/prisma/client.js'
import { HttpError } from '../errors/HttpError.js'
import { reportService } from '../services/report.service.js'

const MESSAGE_MAX_LENGTH = 500

const CARD_REASONS: ReportReason[] = ['inappropriate', 'offensive', 'impersonation', 'other']
const USER_REASONS: ReportReason[] = ['inappropriate', 'offensive', 'harassment', 'impersonation', 'spam', 'other']

export const reportController = {
    async create(req: Request, res: Response) {
        const { cardId, userId, reason, message } = req.body ?? {}

        const isCard = Number.isInteger(cardId)
        const isUser = Number.isInteger(userId)

        if (isCard === isUser) throw new HttpError(400, 'Il faut signaler une carte ou un joueur')

        const allowedReasons = isCard ? CARD_REASONS : USER_REASONS
        if (!allowedReasons.includes(reason)) throw new HttpError(400, 'Motif invalide')

        if (message !== undefined && typeof message !== 'string') throw new HttpError(400, 'Message invalide')
        const cleanMessage: string | null = message?.trim() || null
        if (cleanMessage && cleanMessage.length > MESSAGE_MAX_LENGTH) {
            throw new HttpError(400, `Le message ne doit pas dépasser ${MESSAGE_MAX_LENGTH} caractères`)
        }

        await reportService.create(res.locals.userId, isCard ? { cardId } : { userId }, reason, cleanMessage)
        res.status(201).json({ ok: true })
    },
}
