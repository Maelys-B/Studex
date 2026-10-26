import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { cardsRouter } from './routes/cards.js'
import { authRouter } from './routes/auth.js'
import type { Request, Response, NextFunction } from 'express'

const app = express()

app.use(cors())          
app.use(express.json())  

app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
})

app.use('/api/cards', cardsRouter)
app.use('/api/auth', authRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ erreur: 'Erreur serveur' });
});

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`)
})


