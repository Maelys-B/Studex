import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import requireCard from '../middleware/requireCard.js'
import { collectionController } from '../controllers/collection.controller.js'

export const collectionRouter = Router()
collectionRouter.use(verifyToken, requireCard)

collectionRouter.get('/', collectionController.list)
collectionRouter.delete('/', collectionController.remove)
