import { Router } from 'express'
import { db } from '../db.js'

export const cardsRouter = Router()

cardsRouter.get('/', async (_req, res) => {
    const [rows] = await db.query('SELECT id, name, subtitle, image, color, rarity, type FROM cards ORDER BY id')
    res.json(rows)
})
