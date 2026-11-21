import type { Request, Response } from 'express'
import { boosterService } from '../services/booster.service.js'

export const boosterController = {
    async getStatus(_req: Request, res: Response) {
        res.json(await boosterService.getStatus(res.locals.userId))
    },

    async open(_req: Request, res: Response) {
        res.json(await boosterService.open(res.locals.userId))
    },
}
