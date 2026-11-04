import { Router } from 'express'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'
import { db } from '../db.js'
import verifierToken from '../middleware/verifierToken.js'

export const friendsRouter = Router()
friendsRouter.use(verifierToken)

type Relation = 'none' | 'sent' | 'received' | 'friends'

const FRIENDS_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} ._'-]*$/u

friendsRouter.get('/search', async (req, res) => {
    const userId = res.locals.userId
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''

    if (q.length < 2 || q.length > 50) {
        return res.status(400).json({ erreur: 'La recherche doit faire entre 2 et 50 caractères' })
    }
    if (!FRIENDS_PATTERN.test(q)) {
        return res.status(400).json({ erreur: 'La recherche contient des caractères non autorisés' })
    }

    const escaped = q.replace(/[\\%_]/g, '\\$&')

    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT u.id, u.pseudo,
            f.status, f.requester_id
        FROM users u
        LEFT JOIN friendships f
            ON f.user_low = LEAST(u.id, ?) AND f.user_high = GREATEST(u.id, ?)
        WHERE u.pseudo LIKE ? AND u.id <> ?
        ORDER BY u.pseudo
        LIMIT 10`,
        [userId, userId, `${escaped}%`, userId]
    )

    const results = rows.map(r => {
        let relation: Relation = 'none'
        if (r.status === 'accepted') relation = 'friends'
        else if (r.status === 'pending') relation = r.requester_id === userId ? 'sent' : 'received'
        return { id: r.id, pseudo: r.pseudo, relation }
    })

    res.json(results)
})

friendsRouter.post('/requests', async (req, res) => {
    const userId = res.locals.userId
    const targetId = req.body?.userId

    if (!Number.isInteger(targetId)) {
        return res.status(400).json({ erreur: 'Joueur invalide'})
    }
    if (targetId === userId) {
        return res.status(400).json({ erreur: 'Tu ne peux pas t\'ajouter toi-même'})
    }

    const [users] = await db.query<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [targetId])
    if (users.length === 0) {
        return res.status(404).json({ erreur: 'Joueur introuvable' })
    }

    try {
        await db.query<ResultSetHeader>(
            'INSERT INTO friendships (requester_id, addressee_id) VALUES (?, ?)',
            [userId, targetId]
        )
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erreur: 'Une demande ou une amitié existe déjà avec ce joueur' })
        }
        throw err
    }

    res.status(201).json({ relation: 'sent' })
})

friendsRouter.get('/requests', async (_req, res) => {
    const userId = res.locals.userId
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT f.id, u.id AS userId, u.pseudo
        FROM friendships f JOIN users u ON u.id = f.requester_id
        WHERE f.addressee_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC`,
        [userId]
    )

    res.json(rows)
})

friendsRouter.get('/', async (_req, res) => {
    const userId = res.locals.userId
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT u.id, u.pseudo
        FROM friendships f
        JOIN users u ON u.id = IF(f.requester_id = ?, f.addressee_id, f.requester_id)
        WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'
        ORDER BY u.pseudo`,
        [userId, userId, userId]
    )

    res.json(rows)   
})

friendsRouter.patch('/requests/:id', async (req, res) => {
    const userId = res.locals.userId
    const requestId = Number(req.params.id)
    const status = req.body?.status

    if (status !== 'accepted' && status !== 'rejected') {
        return res.status(400).json({ erreur: 'Statut invalide' })
    }

    const sql = status === 'accepted'
        ? `UPDATE friendships SET status = 'accepted'
           WHERE id = ? AND addressee_id = ? AND status = 'pending'`
        : `DELETE FROM friendships
           WHERE id = ? AND addressee_id = ? AND status = 'pending'`
    
    const [result] = await db.query<ResultSetHeader>(sql, [requestId, userId])
    if (result.affectedRows === 0) {
        return res.status(404).json({ erreur: 'Demande introuvable' })
    }

    res.json({ status })
})

friendsRouter.delete('/:userId', async (req, res) => {
    const userId = res.locals.userId
    const otherId = Number(req.params.userId)

    const [result] = await db.query<ResultSetHeader>(
        `DELETE FROM friendships
        WHERE user_low = LEAST(?, ?) AND user_high = GREATEST(?, ?) AND status = 'accepted'`,
        [userId, otherId, userId, otherId]
    )
    if (result.affectedRows === 0) {
        return res.status(404).json({ erreur: 'Ami introuvable' })
    }
    
    res.status(204).end()
})


