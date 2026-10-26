import express from 'express'
import cors from 'cors'
import { boosterRouter } from './routes/boosters'

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/boosters', boosterRouter)

app.listen(3000, () => console.log('API sur http://localhost:3000'))