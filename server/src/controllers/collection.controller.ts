import type { Request, Response } from 'express'
import { HttpError } from '../errors/HttpError.js'
import { collectionService } from '../services/collection.service.js'

export const collectionController = {
    async list(_req: Request, res: Response) {
        res.json(await collectionService.list(res.locals.userId))
    },

    async sell(req: Request, res: Response) {
        const { cardId, count } = req.body ?? {}

        if (!Number.isInteger(cardId)) throw new HttpError(400, 'Identifiant de carte invalide')
        if (!Number.isInteger(count) || count < 1) throw new HttpError(400, 'Nombre de cartes à vendre invalide')

        res.json(await collectionService.sell(res.locals.userId, cardId, count))
    },
}
