import type { Request, Response } from 'express'
import { HttpError } from '../errors/HttpError.js'
import { friendService } from '../services/friend.service.js'

const SEARCH_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} ._'-]*$/u

export const friendController = {
    async search(req: Request, res: Response) {
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''

        if (q.length < 2 || q.length > 50) {
            throw new HttpError(400, 'La recherche doit faire entre 2 et 50 caractères')
        }
        if (!SEARCH_PATTERN.test(q)) {
            throw new HttpError(400, 'La recherche contient des caractères non autorisés')
        }

        res.json(await friendService.search(res.locals.userId, q))
    },

    async sendRequest(req: Request, res: Response) {
        const targetId = req.body?.userId
        if (!Number.isInteger(targetId)) throw new HttpError(400, 'Joueur invalide')

        await friendService.sendRequest(res.locals.userId, targetId)
        res.status(201).json({ relation: 'sent' })
    },

    async listReceivedRequests(_req: Request, res: Response) {
        res.json(await friendService.listReceivedRequests(res.locals.userId))
    },

    async listFriends(_req: Request, res: Response) {
        res.json(await friendService.listFriends(res.locals.userId))
    },

    async answerRequest(req: Request, res: Response) {
        const status = req.body?.status
        if (status !== 'accepted' && status !== 'rejected') throw new HttpError(400, 'Statut invalide')

        const requestId = Number(req.params.id)
        if (!Number.isInteger(requestId)) throw new HttpError(404, 'Demande introuvable')

        await friendService.answerRequest(res.locals.userId, requestId, status)
        res.json({ status })
    },

    async removeFriend(req: Request, res: Response) {
        const otherId = Number(req.params.userId)
        if (!Number.isInteger(otherId)) throw new HttpError(404, 'Ami introuvable')

        await friendService.removeFriend(res.locals.userId, otherId)
        res.status(204).end()
    },
}
