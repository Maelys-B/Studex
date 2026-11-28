import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import requireCard from '../middleware/requireCard.js'
import { tradeController } from '../controllers/trade.controller.js'

export const tradeRouter = Router()
tradeRouter.use(verifyToken, requireCard)

tradeRouter.get('/', tradeController.list)
tradeRouter.post('/', tradeController.create)
tradeRouter.get('/partners/:userId/collection', tradeController.partnerCollection)
tradeRouter.get('/:id', tradeController.get)
tradeRouter.post('/:id/counter', tradeController.counter)
tradeRouter.post('/:id/accept', tradeController.accept)
tradeRouter.post('/:id/decline', tradeController.decline)
tradeRouter.post('/:id/cancel', tradeController.cancel)
