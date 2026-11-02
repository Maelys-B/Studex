import { Router } from 'express'
import type { ResultSetHeader } from 'mysql2'
import { db } from '../db.js'
import verifierToken from '../middleware/verifierToken.js'
import { validateStudentCard } from '../services/studentCardValidation.js'

export const cardsRouter = Router()

cardsRouter.get('/', async (_req, res) => {
    const [rows] = await db.query(
        "SELECT id, name, position_collection, subtitle, image, color, rarity, type FROM cards WHERE status = 'approved' ORDER BY id"
    )
    res.json(rows)
})

cardsRouter.get('/mine', verifierToken, async (_req, res) => {
    const [rows] = await db.query(
        'SELECT id, name, subtitle, color, avatar, rarity, type, status FROM cards WHERE created_by = ?',
        [res.locals.userId]
    )
    const card = (rows as unknown[])[0]
    if (!card) {
        return res.status(404).json({ erreur: 'Aucune carte'})
    }
    res.json(card)
})

cardsRouter.post('/mine', verifierToken, async (req, res) => {
    const data = validateStudentCard(req.body)
    if (typeof data === 'string') {
        return res.status(400).json({ erreur: data })
    }

    try {
        const name = `${data.first_name}.${data.last_name}`

        await db.query(
            `INSERT INTO cards (name, subtitle, color, avatar, rarity, type, created_by, status, position_collection)
             VALUES (?, ?, ?, ?, 'commun', 'student', ?, 'pending', 0)`,
             [name, data.subtitle, data.color, JSON.stringify(data.avatar), res.locals.userId]
        )
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erreur: 'Tu as déjà créé ta carte'})
        }
        throw err
    }
    res.status(201).json({ status: 'pending' })
})

cardsRouter.put('/mine', verifierToken, async (req, res) => {
    const data = validateStudentCard(req.body)
    if (typeof data === 'string') {
        return res.status(400).json({ erreur: data })
    }

    const name = `${data.first_name}.${data.last_name}`

    const [result] = await db.query<ResultSetHeader>(
        `UPDATE cards SET name = ?, subtitle = ?, color = ?, avatar = ?, status = 'pending'
        WHERE created_by = ?`,
        [name, data.subtitle, data.color, JSON.stringify(data.avatar), res.locals.userId]
    )
    if (result.affectedRows === 0) {
        return res.status(404).json({ erreur: 'Aucune carte à modifier' })
    }
    res.json({ status: 'pending'})
})