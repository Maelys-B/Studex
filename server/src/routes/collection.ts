import { Router } from 'express'
import { db } from '../db.js'
import verifierToken from '../middleware/verifierToken.js'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'
import { withTransaction } from '../services/boosterStore.js'

export const collectionRouter = Router()
collectionRouter.use(verifierToken)

collectionRouter.get('/', async (_req, res, next) => {
    try {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT id, name, position_collection, subtitle, image, color, rarity, type, quantity, obtained_at FROM cards JOIN user_cards ON cards.id = user_cards.card_id WHERE user_cards.user_id = ? ORDER BY obtained_at DESC',
            [res.locals.userId]
        )
        res.json(rows)
    }
    catch (err) {
        next(err)
    }
})

collectionRouter.delete('/', async (req, res, next) => {
    try {
        const { cardIds, tout } = req.body

        if (!Array.isArray(cardIds) || cardIds.length === 0) {
            return res.status(400).json({ erreur: 'Identifiant de carte invalide' });
        }
        
        if (!cardIds.every(Number.isInteger)) {
            return res.status(400).json({ erreur: 'Identifiant de carte invalide' });
        }   

        let result: ResultSetHeader;

        if (tout === true) {
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
            return res.status(404).json({ erreur: 'Carte absente de la collection' });
        }

        res.status(204).end()
    }
    catch (err) {
        next(err)
    }
})
