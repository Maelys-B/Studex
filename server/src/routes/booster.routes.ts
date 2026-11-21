import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import requireCard from '../middleware/requireCard.js'
import { boosterController } from '../controllers/booster.controller.js'

export const boosterRouter = Router()
boosterRouter.use(verifyToken, requireCard)

boosterRouter.get('/', boosterController.getStatus)
boosterRouter.post('/open', boosterController.open)
