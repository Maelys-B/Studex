import type { Request, Response, NextFunction } from 'express'
import { Prisma } from '../generated/prisma/client.js'
import { HttpError } from '../errors/HttpError.js'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message })
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return res.status(404).json({ error: 'Ressource introuvable' })
    }
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
}
