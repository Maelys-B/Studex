import type { Request, Response } from 'express'
import { HttpError } from '../errors/HttpError.js'
import { collectionService } from '../services/collection.service.js'

export const collectionController = {
    async list(_req: Request, res: Response) {
        res.json(await collectionService.list(res.locals.userId))
    },

    async remove(req: Request, res: Response) {
        const { cardIds, all } = req.body ?? {}

        if (!Array.isArray(cardIds) || cardIds.length === 0 || !cardIds.every(Number.isInteger)) {
            throw new HttpError(400, 'Identifiant de carte invalide')
        }

        await collectionService.remove(res.locals.userId, cardIds, all === true)
        res.status(204).end()
    },
}
