import { Router } from 'express'
import { db } from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import verifyToken from '../middleware/verifyToken.js'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'
import type { PublicUser } from '../types.js'
import { normalizeEmail, PASSWORD_REGEX } from '../services/authValidation.js'
import { containsForbiddenWord } from '../services/wordFilter.js';

export const authRouter = Router()

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET missing from .env')
}

authRouter.post('/register', async (req, res, next) => {
    try {
        const { email: rawEmail, password, username: rawUsername } = req.body

        if (!rawEmail) {
            return res.status(400).json({ error: 'Email requis' })
        }

        if (!password) {
            return res.status(400).json({ error: 'Mot de passe requis' })
        }

        if (!rawUsername) {
            return res.status(400).json({ error: 'Pseudo requis' })
        }

        const email = normalizeEmail(rawEmail)
        const username = rawUsername.trim()

        if (!username) {
            return res.status(400).json({ error: 'Pseudo requis' })
        }

        if (containsForbiddenWord(username)) {
            return res.status(400).json({ error: 'Ce pseudo contient un mot interdit'})
        }

        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({
                error:
                    'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
            })
        }

        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        )

        if (rows.length > 0) {
            return res.status(409).json({ error: "Email déjà existant" })
        }

        const hash = await bcrypt.hash(password, 10)

        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO users (email, password, username) VALUES (?, ?, ?)',
            [email, hash, username]
        )

        const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, { expiresIn: '24h' })

        const publicUser: PublicUser = {
            id: result.insertId,
            username,
            email,
            role: 'user',
        }

        res.status(201).json({ token, user: publicUser })
    } catch (err) {
        next(err)
    }
})

authRouter.post('/login', async (req, res, next) => {
    try {
        const { email: rawEmail, password } = req.body

        if (!rawEmail || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' })
        }

        const email = normalizeEmail(rawEmail)

        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )
        const user = rows[0]

        if (!user) {
            return res.status(401).json({ error: "Identifiants incorrects" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Identifiants incorrects" })
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' })

        const publicUser: PublicUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        }

        res.json({ token, user: publicUser })
    } catch (err) {
        next(err)
    }
})

authRouter.get('/profile', verifyToken, async (_req, res, next) => {
    try {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [res.locals.userId]
        )
        const user = rows[0]

        if (!user) {
            return res.status(401).json({ error: 'Veuillez vous reconnecter' })
        }

        const publicUser: PublicUser = { id: user.id, username: user.username, email: user.email, role: user.role }
        res.json({ user: publicUser })
    } catch (err) {
        next(err)
    }
})
