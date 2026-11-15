import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { db } from '../db.js'
import verifyToken from '../middleware/verifyToken.js'
import { validateStudentCard } from '../services/studentCardValidation.js'
import { loadAttacksByCard } from '../services/boosterStore.js'

export const cardsRouter = Router()

cardsRouter.get('/', async (_req, res) => {
    const [rows] = await db.query(
        "SELECT id, name, position_collection, subtitle, image, color, rarity, type FROM cards WHERE status = 'approved' ORDER BY id"
    )
    res.json(rows)
})

cardsRouter.get('/showcase', async (_req, res) => {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT id, name, position_collection, subtitle, description, image, hp, rarity, type
        FROM cards WHERE status = 'approved' AND type IN ('collection', 'battle')`
    )
    const attacksByCard = await loadAttacksByCard(db, rows.filter(row => row.type === 'battle').map(row => row.id))
    res.json(rows.map(row => row.type === 'battle' ? { ...row, attacks: attacksByCard.get(row.id) ?? [] } : row))
})

cardsRouter.get('/mine', verifyToken, async (_req, res) => {
    const [rows] = await db.query(
        'SELECT id, name, subtitle, color, avatar, rarity, type, status FROM cards WHERE created_by = ?',
        [res.locals.userId]
    )
    const card = (rows as unknown[])[0]
    if (!card) {
        return res.status(404).json({ error: 'Aucune carte'})
    }
    res.json(card)
})

cardsRouter.post('/mine', verifyToken, async (req, res) => {
    const data = validateStudentCard(req.body)
    if (typeof data === 'string') {
        return res.status(400).json({ error: data })
    }

    try {
        const name = `${data.first_name}.${data.last_name}`

        await db.query(
            `INSERT INTO cards (name, subtitle, color, avatar, rarity, type, created_by, status, position_collection)
             VALUES (?, ?, ?, ?, 'common', 'student', ?, 'pending', 0)`,
             [name, data.subtitle, data.color, JSON.stringify(data.avatar), res.locals.userId]
        )
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Tu as déjà créé ta carte'})
        }
        throw err
    }
    res.status(201).json({ status: 'pending' })
})

cardsRouter.put('/mine', verifyToken, async (req, res) => {
    const data = validateStudentCard(req.body)
    if (typeof data === 'string') {
        return res.status(400).json({ error: data })
    }

    const name = `${data.first_name}.${data.last_name}`

    const [result] = await db.query<ResultSetHeader>(
        `UPDATE cards SET name = ?, subtitle = ?, color = ?, avatar = ?, status = 'pending'
        WHERE created_by = ?`,
        [name, data.subtitle, data.color, JSON.stringify(data.avatar), res.locals.userId]
    )
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Aucune carte à modifier' })
    }
    res.json({ status: 'pending'})
})