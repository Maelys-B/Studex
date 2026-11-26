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
import { tradeRouter } from './routes/trade.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

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
app.use('/api/trades', tradeRouter)

app.use(errorHandler)

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})


