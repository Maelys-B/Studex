import express from 'express'
import cors from 'cors'
import 'dotenv/config' 
import { cardRouter } from './routes/card.routes.js'
import { boostersRouter } from './routes/boosters.js'
import { authRouter } from './routes/auth.js'
import { collectionRouter } from './routes/collection.routes.js'
import { adminRouter } from './routes/admin.routes.js'
import { friendsRouter } from './routes/friends.js'
import { profileRouter } from './routes/profile.js'
import { reportsRouter } from './routes/reports.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors())          
app.use(express.json())  

app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
})

app.use('/api/cards', cardRouter)
app.use('/api/boosters', boostersRouter)
app.use('/api/auth', authRouter);
app.use('/api/collection', collectionRouter)
app.use('/api/admin', adminRouter)
app.use('/api/friends', friendsRouter)
app.use('/api/profile', profileRouter)
app.use('/api/reports', reportsRouter)

app.use(errorHandler)

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})


