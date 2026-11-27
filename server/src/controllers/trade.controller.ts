import type { Request, Response } from 'express'
import { HttpError } from '../errors/HttpError.js'
import { tradeService } from '../services/trade.service.js'
import { validateOffer } from '../services/tradeLogic.js'

function parseTradeId(req: Request) {
    const tradeId = Number(req.params.id)
    if (!Number.isInteger(tradeId)) throw new HttpError(404, 'Échange introuvable')
    return tradeId
}

function parseOffer(req: Request) {
    const offer = validateOffer(req.body)
    if (typeof offer === 'string') throw new HttpError(400, offer)
    return offer
}

export const tradeController = {
    async list(_req: Request, res: Response) {
        res.json(await tradeService.list(res.locals.userId))
    },

    async get(req: Request, res: Response) {
        res.json(await tradeService.get(res.locals.userId, parseTradeId(req)))
    },

    async partnerCollection(req: Request, res: Response) {
        const partnerId = Number(req.params.userId)
        if (!Number.isInteger(partnerId)) throw new HttpError(404, 'Joueur introuvable')

        res.json(await tradeService.partnerCollection(res.locals.userId, partnerId))
    },

    async create(req: Request, res: Response) {
        const partnerId = req.body?.partnerId
        if (!Number.isInteger(partnerId)) throw new HttpError(400, 'Joueur invalide')

        res.status(201).json(await tradeService.create(res.locals.userId, partnerId, parseOffer(req)))
    },

    async counter(req: Request, res: Response) {
        res.json(await tradeService.counter(res.locals.userId, parseTradeId(req), parseOffer(req)))
    },

    async accept(req: Request, res: Response) {
        res.json(await tradeService.accept(res.locals.userId, parseTradeId(req)))
    },

    async decline(req: Request, res: Response) {
        await tradeService.decline(res.locals.userId, parseTradeId(req))
        res.status(204).end()
    },

    async cancel(req: Request, res: Response) {
        await tradeService.cancel(res.locals.userId, parseTradeId(req))
        res.status(204).end()
    },
}
