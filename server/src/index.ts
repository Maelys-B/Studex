import express from 'express'
import cors from 'cors'
import 'dotenv/config' 
import { cardsRouter } from './routes/cards.js'
import { boostersRouter } from './routes/boosters.js'
import { authRouter } from './routes/auth.js'
import type { Request, Response, NextFunction } from 'express'
import { adminRouter } from './routes/admin.js';

const app = express()

app.use(cors())          
app.use(express.json())  

app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
})

app.use('/api/cards', cardsRouter)
app.use('/api/boosters', boostersRouter)
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter)

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ erreur: 'Erreur serveur' });
});

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`)
})


