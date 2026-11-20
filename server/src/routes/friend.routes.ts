import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import requireCard from '../middleware/requireCard.js'
import { friendController } from '../controllers/friend.controller.js'

export const friendRouter = Router()
friendRouter.use(verifyToken, requireCard)

friendRouter.get('/search', friendController.search)
friendRouter.post('/requests', friendController.sendRequest)
friendRouter.get('/requests', friendController.listReceivedRequests)
friendRouter.patch('/requests/:id', friendController.answerRequest)
friendRouter.get('/', friendController.listFriends)
friendRouter.delete('/:userId', friendController.removeFriend)
