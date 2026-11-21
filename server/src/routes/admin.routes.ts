import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import verifyAdmin from '../middleware/verifyAdmin.js'
import { adminController } from '../controllers/admin.controller.js'

export const adminRouter = Router()
adminRouter.use(verifyToken, verifyAdmin)

adminRouter.get('/cards/pending', adminController.listPendingCards)
adminRouter.patch('/cards/:id', adminController.setCardStatus)
