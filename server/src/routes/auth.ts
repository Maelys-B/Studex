import { Router } from 'express'
import { db } from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import verifierToken from '../middleware/verifierToken.js'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'
import type { PublicUser } from '../types.js'

export const authRouter = Router()

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET manquant dans le .env')
}

authRouter.post('/register', async (req, res, next) => {
    try {
        const { email: rawEmail, mdp, pseudo: rawPseudo } = req.body

        if (!rawEmail) {
            return res.status(400).json({ erreur: 'Email requis' })
        }

        if (!mdp) {
            return res.status(400).json({ erreur: 'Mot de passe requis' })
        }

        if (!rawPseudo) {
            return res.status(400).json({ erreur: 'Pseudo requis' })
        }

        const email = rawEmail.trim().toLowerCase()
        const pseudo = rawPseudo.trim()

        if (!pseudo) {
            return res.status(400).json({ erreur: 'Pseudo requis' })
        }

        const regexMotDePasse = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

        if (!regexMotDePasse.test(mdp)) {
            return res.status(400).json({
                erreur:
                    'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
            })
        }

        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        )

        if (rows.length > 0) {
            return res.status(409).json({ erreur: "Email déjà existant" })
        }

        const hash = await bcrypt.hash(mdp, 10)

        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO users (email, mdp, pseudo) VALUES (?, ?, ?)',
            [email, hash, pseudo]
        )

        const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, { expiresIn: '24h' })

        const publicUser: PublicUser = {
            id: result.insertId,
            pseudo,
            email,
        }

        res.status(201).json({ token, user: publicUser })
    } catch (err) {
        next(err)
    }
})

authRouter.post('/login', async (req, res, next) => {
    try {
        const { email: rawEmail, mdp } = req.body

        if (!rawEmail || !mdp) {
            return res.status(400).json({ erreur: 'Email et mot de passe requis' })
        }

        const email = rawEmail.trim().toLowerCase()

        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )
        const user = rows[0]

        if (!user) {
            return res.status(401).json({ erreur: "Identifiants incorrects" })
        }

        const motDePasseValide = await bcrypt.compare(mdp, user.mdp)

        if (!motDePasseValide) {
            return res.status(401).json({ erreur: "Identifiants incorrects" })
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' })

        const publicUser: PublicUser = {
            id: user.id,
            pseudo: user.pseudo,
            email: user.email,
        }

        res.json({ token, user: publicUser })
    } catch (err) {
        next(err)
    }
})

authRouter.get('/profil', verifierToken, (_req, res) => {
    res.json({ message: 'Accès autorisé !', userId: res.locals.userId })
})

