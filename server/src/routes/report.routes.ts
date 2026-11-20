import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import { reportController } from '../controllers/report.controller.js'

export const reportRouter = Router()
reportRouter.use(verifyToken)

reportRouter.post('/', reportController.create)
