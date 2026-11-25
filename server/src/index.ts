import express from 'express'
import cors from 'cors'
import 'dotenv/config' 
import { cardRouter } from './routes/card.routes.js'
import { boosterRouter } from './routes/booster.routes.js'
import { authRouter } from './routes/auth.routes.js'
import { collectionRouter } from './routes/collection.routes.js'
import { adminRouter } from './routes/admin.routes.js'
import { friendRouter } from './routes/friend.routes.js'
import { profileRouter } from './routes/profile.routes.js'
import { reportRouter } from './routes/report.routes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { readToken } from './lib/token.js'
import { Connections } from './realtime/connection.js'
import { startSocketServer } from './realtime/socketServer.js'
import { RoomManager } from './battle/roomManager.js'

const app = express()

app.use(cors())          
app.use(express.json())  

app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
})

app.use('/api/cards', cardRouter)
app.use('/api/boosters', boosterRouter)
app.use('/api/auth', authRouter);
app.use('/api/collection', collectionRouter)
app.use('/api/admin', adminRouter)
app.use('/api/friends', friendRouter)
app.use('/api/profile', profileRouter)
app.use('/api/reports', reportRouter)

app.use(errorHandler)

const port = Number(process.env.PORT) || 3000

const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})

const connections = new Connections()
const rooms = new RoomManager((userId, message) => connections.send(userId, message))

startSocketServer(server, connections, {
    readToken,
    onConnect: userId => rooms.connect(userId),
    onMessage: (userId, message) => {
        switch (message.type) {
            case 'ACTION':
                rooms.play(userId, message.battleId, message.seq, message.action)
                break
            case 'FORFEIT':
                rooms.forfeit(userId, message.battleId)
                break
        }
    },
    onDisconnect: userId => rooms.disconnect(userId)
})


