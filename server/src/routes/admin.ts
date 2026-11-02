import { Router } from 'express'
import type { ResultSetHeader } from 'mysql2'
import { db } from '../db.js'
import verifierToken from '../middleware/verifierToken.js'
import verifierAdmin from '../middleware/verifierAdmin.js'

export const adminRouter = Router()
adminRouter.use(verifierToken, verifierAdmin)

adminRouter.get('/cards/pending', async (_req, res) => {
    const [rows] = await db.query(
        `SELECT c.id, c.name, c.subtitle, c.color, c.avatar, u.pseudo AS author
        FROM cards c JOIN users u ON u.id = c.created_by
        WHERE c.status = 'pending'
        ORDER BY c.id`
    )
    res.json(rows)
})

adminRouter.patch('/cards/:id', async (req, res) => {
    const status = req.body?.status
    if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({ erreur: 'Statut invalide' })
    }

    const [result] = await db.query<ResultSetHeader>(
        'UPDATE cards SET status = ? WHERE id = ? AND created_by IS NOT NULL',
        [status, Number(req.params.id)]
    )
    if (result.affectedRows === 0) {
        return res.status(404).json({ erreur: 'Carte introuvable'})
    }
    res.json({ status })
})