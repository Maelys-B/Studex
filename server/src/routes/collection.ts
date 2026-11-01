import { Router } from 'express'
import { db } from '../db.js'
import verifierToken from '../middleware/verifierToken.js'
import type { RowDataPacket} from 'mysql2'

export const collectionRouter = Router()
collectionRouter.use(verifierToken)

collectionRouter.get('/', async (_req, res, next) => {
    try{
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT id, name, position_collection, subtitle, image, color, rarity, type, quantity, obtained_at FROM cards JOIN user_cards ON cards.id = user_cards.card_id WHERE user_cards.user_id = ? ORDER BY obtained_at DESC',
            [res.locals.userId]
        )
        res.json(rows)
    }
    catch(err){
        next(err)
    }
})
