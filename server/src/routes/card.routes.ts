import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import { cardController } from '../controllers/card.controller.js'

export const cardRouter = Router()

cardRouter.get('/', cardController.list)
cardRouter.get('/showcase', cardController.showcase)
cardRouter.get('/mine', verifyToken, cardController.getMine)
cardRouter.post('/mine', verifyToken, cardController.createMine)
cardRouter.put('/mine', verifyToken, cardController.updateMine)
cardRouter.patch('/mine/talent', verifyToken, cardController.updateTalent)
