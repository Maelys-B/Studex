import type { Request, Response, NextFunction } from 'express'
import type { RowDataPacket } from 'mysql2'
import { db } from '../db.js'

export default async function requireCard(_req: Request, res: Response, next: NextFunction) {
    const [rows] = await db.query<RowDataPacket[]>(
        'SELECT status FROM cards WHERE created_by = ? LIMIT 1',[res.locals.userId]
    )
    if (rows.length === 0 || rows[0].status === 'rejected') {
        return res.status(403).json({ error: 'Ta carte doit être créée et non refusée'})
    }
    next()
}