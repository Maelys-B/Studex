import type { Request, Response } from 'express'
import { HttpError } from '../errors/HttpError.js'
import { cardService } from '../services/card.service.js'
import { isTalent, validateStudentCard } from '../services/studentCardValidation.js'
import { Talent } from '../battle/talent.js';

function readStudentCard(req: Request) {
    const data = validateStudentCard(req.body)
    if (typeof data === 'string') throw new HttpError(400, data)
    return data
}

function readTalent(req: Request): Talent {
    const talent = req.body?.talent
    if (!isTalent(talent)) {
        throw new HttpError(400, 'Talent invalide')
    }
    return talent
}

export const cardController = {
    async list(_req: Request, res: Response) {
        res.json(await cardService.listApproved())
    },

    async showcase(_req: Request, res: Response) {
        res.json(await cardService.showcase())
    },

    async getMine(_req: Request, res: Response) {
        res.json(await cardService.getMine(res.locals.userId))
    },

    async createMine(req: Request, res: Response) {
        await cardService.createMine(res.locals.userId, readStudentCard(req), readTalent(req))
        res.status(201).json({ status: 'pending' })
    },

    async updateMine(req: Request, res: Response) {
        await cardService.updateMine(res.locals.userId, readStudentCard(req))
        res.json({ status: 'pending' })
    },

    async updateTalent(req: Request, res: Response) {
        const talent = readTalent(req)
        await cardService.updateTalent(res.locals.userId, talent)
        res.json({ talent })
    }
}
