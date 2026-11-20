import type { Request, Response, NextFunction } from 'express'
import { cardRepository } from '../repositories/card.repository.js'

export default async function requireCard(_req: Request, res: Response, next: NextFunction) {
    const card = await cardRepository.findStatusByCreator(res.locals.userId)
    if (!card || card.status === 'rejected') {
        return res.status(403).json({ error: 'Ta carte doit être créée et non refusée'})
    }
    next()
}
