import { Router } from 'express'
import bcrypt from 'bcryptjs'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'
import { db } from '../db.js'
import verifierToken from '../middleware/verifierToken.js'
import type { PublicUser } from '../types.js'
import { nettoyerEmail, regexMotDePasse } from '../services/authValidation.js'

export const profileRouter = Router()
profileRouter.use(verifierToken)

profileRouter.patch('/', async (req, res, next) => {
    try {
        const { email: rawEmail, pseudo: rawPseudo } = req.body

        if (!rawEmail || !rawPseudo) {
            return res.status(400).json({ erreur: 'Pseudo ou Email requis' })
        }

        const email = nettoyerEmail(rawEmail)
        const pseudo = rawPseudo.trim()

        if (!pseudo) {
            return res.status(400).json({ erreur: 'Pseudo requis' })
        }

        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT id FROM users WHERE email = ? AND id != ?",
            [email, res.locals.userId]
        )

        if (rows.length > 0) {
            return res.status(409).json({ erreur: "Email déjà existant" })
        }

        await db.query<ResultSetHeader>(
            "UPDATE users SET pseudo = ?, email = ? WHERE id = ?",
            [pseudo, email, res.locals.userId]
        )

        const [result] = await db.query<RowDataPacket[]>(
            "SELECT id, pseudo, email, role FROM users WHERE id = ?",
            [res.locals.userId]
        )

        const user = result[0]

        const publicUser: PublicUser = {
            id: res.locals.userId,
            pseudo: user.pseudo,
            email: user.email,
            role: user.role,
        }

        res.json({ user: publicUser })
    } catch (err) {
        next(err)
    }
})

profileRouter.patch('/mdp', async (req, res, next) => {
    try {
        const { ancienMdp, nouveauMdp } = req.body

        if (!ancienMdp || !nouveauMdp) {
            return res.status(400).json({ erreur: "Veuillez renseigner les deux mots de passes" })
        }

        if (!regexMotDePasse.test(nouveauMdp)) {
            return res.status(400).json({ erreur: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial" })
        }

        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT mdp FROM users WHERE id = ?',
            [res.locals.userId]
        )
        const user = rows[0]

        if (!user) {
            return res.status(401).json({ erreur: "Identifiants incorrects" })
        }

        const ancienValide = await bcrypt.compare(ancienMdp, user.mdp)

        if (!ancienValide) {
            return res.status(401).json({ erreur: "Identifiants incorrects" })
        }

        const hash = await bcrypt.hash(nouveauMdp, 10)

        await db.query<ResultSetHeader>(
            'UPDATE users SET mdp = ? WHERE id = ?',
            [hash, res.locals.userId]
        )

        res.json({ message: 'Changement effectué' })
    } catch (err) {
        next(err)
    }
})
