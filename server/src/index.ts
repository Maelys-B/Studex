import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { cardsRouter } from './routes/cards.js'

const app = express()

app.use(cors())          
app.use(express.json())  

app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
})

app.use('/api/cards', cardsRouter)

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`)
})
