import type { Request, Response } from 'express'
import { HttpError } from '../errors/HttpError.js'
import { cardService } from '../services/card.service.js'
import { validateStudentCard } from '../services/studentCardValidation.js'

function readStudentCard(req: Request) {
    const data = validateStudentCard(req.body)
    if (typeof data === 'string') throw new HttpError(400, data)
    return data
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
        await cardService.createMine(res.locals.userId, readStudentCard(req))
        res.status(201).json({ status: 'pending' })
    },

    async updateMine(req: Request, res: Response) {
        await cardService.updateMine(res.locals.userId, readStudentCard(req))
        res.json({ status: 'pending' })
    },
}
