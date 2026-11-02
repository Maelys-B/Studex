import type { Request, Response, NextFunction } from 'express'
import { db } from '../db.js'

const verifierAdmin = async (_req: Request, res: Response, next: NextFunction) => {
    const [rows] = await db.query('SELECT role FROM users WHERE id = ?', [res.locals.userId])
    const user = (rows as { role: string}[])[0]

    if (user?.role !== 'admin') {
        return res.status(403).json({ erreur: 'Accès réservé aux administrateurs' })
    }
    next()
}

export default verifierAdmin