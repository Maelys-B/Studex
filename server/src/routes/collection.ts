import { Router } from 'express'
import { db } from '../db.js'
import verifyToken from '../middleware/verifyToken.js'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'
import { loadAttacksByCard, withTransaction } from '../services/boosterStore.js'

export const collectionRouter = Router()
collectionRouter.use(verifyToken)

collectionRouter.get('/', async (_req, res, next) => {
    try {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT id, name, position_collection, subtitle, description, image, hp, color, rarity, type, avatar, quantity, obtained_at FROM cards JOIN user_cards ON cards.id = user_cards.card_id WHERE user_cards.user_id = ? ORDER BY obtained_at DESC',
            [res.locals.userId]
        )
        const attacksByCard = await loadAttacksByCard(db, rows.map(row => row.id))

        res.json(rows.map(row => ({ ...row, attacks: attacksByCard.get(row.id) })))
    }
    catch (err) {
        next(err)
    }
})

collectionRouter.delete('/', async (req, res, next) => {
    try {
        const { cardIds, all } = req.body

        if (!Array.isArray(cardIds) || cardIds.length === 0) {
            return res.status(400).json({ error: 'Identifiant de carte invalide' });
        }
        
        if (!cardIds.every(Number.isInteger)) {
            return res.status(400).json({ error: 'Identifiant de carte invalide' });
        }   

        let result: ResultSetHeader;

        if (all === true) {
            result = await withTransaction(async conn => {
                const [deleteResult] = await conn.query<ResultSetHeader>(
                    'DELETE FROM user_cards WHERE card_id IN (?) AND user_id = ?',
                    [cardIds, res.locals.userId]
                )
                return deleteResult
            })
        }
        else {

            result = await withTransaction(async conn => {
                const [updateResult] = await conn.query<ResultSetHeader>(
                    'UPDATE user_cards SET quantity = quantity - 1 WHERE card_id IN (?) AND user_id = ?',
                    [cardIds, res.locals.userId]
                )

                if (updateResult.affectedRows > 0) {
                    await conn.query<ResultSetHeader>(
                        'DELETE FROM user_cards WHERE card_id IN (?) AND user_id = ? AND quantity = 0',
                        [cardIds, res.locals.userId]
                    )
                }
                return updateResult
            })
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Carte absente de la collection' });
        }

        res.status(204).end()
    }
    catch (err) {
        next(err)
    }
})
