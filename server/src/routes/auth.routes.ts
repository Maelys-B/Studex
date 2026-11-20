import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import { authController } from '../controllers/auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)
authRouter.get('/profile', verifyToken, authController.profile)
