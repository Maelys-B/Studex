import { Router } from 'express'
import bcrypt from 'bcryptjs'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'
import { db } from '../db.js'
import verifyToken from '../middleware/verifyToken.js'
import type { PublicUser } from '../types.js'
import { normalizeEmail, PASSWORD_REGEX } from '../services/authValidation.js'

export const profileRouter = Router()
profileRouter.use(verifyToken)

profileRouter.patch('/', async (req, res, next) => {
    try {
        const { email: rawEmail, username: rawUsername } = req.body

        if (!rawEmail || !rawUsername) {
            return res.status(400).json({ error: 'Pseudo ou Email requis' })
        }

        const email = normalizeEmail(rawEmail)
        const username = rawUsername.trim()

        if (!username) {
            return res.status(400).json({ error: 'Pseudo requis' })
        }

        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT id FROM users WHERE email = ? AND id != ?",
            [email, res.locals.userId]
        )

        if (rows.length > 0) {
            return res.status(409).json({ error: "Email déjà existant" })
        }

        await db.query<ResultSetHeader>(
            "UPDATE users SET username = ?, email = ? WHERE id = ?",
            [username, email, res.locals.userId]
        )

        const [result] = await db.query<RowDataPacket[]>(
            "SELECT id, username, email, role FROM users WHERE id = ?",
            [res.locals.userId]
        )

        const user = result[0]

        const publicUser: PublicUser = {
            id: res.locals.userId,
            username: user.username,
            email: user.email,
            role: user.role,
        }

        res.json({ user: publicUser })
    } catch (err) {
        next(err)
    }
})

profileRouter.patch('/password', async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: "Veuillez renseigner les deux mots de passes" })
        }

        if (!PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial" })
        }

        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT password FROM users WHERE id = ?',
            [res.locals.userId]
        )
        const user = rows[0]

        if (!user) {
            return res.status(401).json({ error: "Identifiants incorrects" })
        }

        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password)

        if (!isOldPasswordValid) {
            return res.status(401).json({ error: "Identifiants incorrects" })
        }

        const hash = await bcrypt.hash(newPassword, 10)

        await db.query<ResultSetHeader>(
            'UPDATE users SET password = ? WHERE id = ?',
            [hash, res.locals.userId]
        )

        res.json({ message: 'Changement effectué' })
    } catch (err) {
        next(err)
    }
})
