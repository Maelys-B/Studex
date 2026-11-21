import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import { profileController } from '../controllers/profile.controller.js'

export const profileRouter = Router()
profileRouter.use(verifyToken)

profileRouter.patch('/', profileController.update)
profileRouter.patch('/password', profileController.changePassword)
