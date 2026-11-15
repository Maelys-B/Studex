import { Router } from 'express'
import type { RowDataPacket } from 'mysql2'
import { db } from '../db.js'
import verifyToken from '../middleware/verifyToken.js'
import { transporter, MAIL_FROM } from '../services/mailer.js'

export const reportsRouter = Router()
reportsRouter.use(verifyToken)

const MESSAGE_MAX_LENGTH = 500

const CARD_REASONS = ['inappropriate', 'offensive', 'impersonation', 'other']
const USER_REASONS = ['inappropriate', 'offensive', 'harassment', 'impersonation', 'spam', 'other']

const REASON_LABELS: Record<string, string> = {
    inappropriate: 'Contenu inapproprié',
    offensive: 'Contenu offensant',
    harassment: 'Harcèlement',
    impersonation: "Usurpation d'identité",
    spam: 'Spam',
    other: 'Autre',
}

async function notifyAdmins(reporterId: number, target: string, reason: string, message: string | null) {
    const [admins] = await db.query<RowDataPacket[]>("SELECT email FROM users WHERE role = 'admin'")
    if (admins.length === 0) return

    const [reporters] = await db.query<RowDataPacket[]>('SELECT username FROM users WHERE id = ?', [reporterId])
    const reporter = reporters[0]?.username ?? `#${reporterId}`

    await transporter.sendMail({
        from: MAIL_FROM,
        to: admins.map(a => a.email),
        subject: `[Studex] Nouveau signalement : ${target}`,
        text: [
            `${reporter} (id ${reporterId}) a signalé ${target}.`,
            '',
            `Motif : ${REASON_LABELS[reason] ?? reason}`,
            `Message : ${message ?? '(aucun)'}`,
        ].join('\n'),
    })
}

reportsRouter.post('/', async (req, res) => {
    const reporterId = res.locals.userId
    const { cardId, userId, reason, message } = req.body ?? {}

    const isCard = Number.isInteger(cardId)
    const isUser = Number.isInteger(userId)

    if (isCard === isUser) {
        return res.status(400).json({ error: 'Il faut signaler une carte ou un joueur' })
    }

    const allowedReasons = isCard ? CARD_REASONS : USER_REASONS
    if (!allowedReasons.includes(reason)) {
        return res.status(400).json({ error: 'Motif invalide' })
    }

    if (message !== undefined && typeof message !== 'string') {
        return res.status(400).json({ error: 'Message invalide' })
    }
    const cleanMessage = message?.trim() || null
    if (cleanMessage && cleanMessage.length > MESSAGE_MAX_LENGTH) {
        return res.status(400).json({ error: `Le message ne doit pas dépasser ${MESSAGE_MAX_LENGTH} caractères` })
    }

    let target: string

    if (isCard) {
        const [cards] = await db.query<RowDataPacket[]>(
            `SELECT c.id, c.name, c.created_by, u.username AS author
            FROM cards c LEFT JOIN users u ON u.id = c.created_by
            WHERE c.id = ?`,
            [cardId]
        )
        const card = cards[0]
        if (!card) {
            return res.status(404).json({ error: 'Carte introuvable' })
        }
        if (card.created_by === null) {
            return res.status(400).json({ error: 'Seules les cartes créées par des joueurs peuvent être signalées' })
        }
        if (card.created_by === reporterId) {
            return res.status(400).json({ error: 'Tu ne peux pas signaler ta propre carte' })
        }
        target = `la carte « ${card.name} » (id ${card.id}) de ${card.author}`
    } else {
        if (userId === reporterId) {
            return res.status(400).json({ error: 'Tu ne peux pas te signaler toi-même' })
        }

        const [users] = await db.query<RowDataPacket[]>(
            'SELECT id, username FROM users WHERE id = ?',
            [userId]
        )
        if (users.length === 0) {
            return res.status(404).json({ error: 'Joueur introuvable' })
        }
        target = `le joueur ${users[0].username} (id ${users[0].id})`
    }

    try {
        await db.query(
            'INSERT INTO reports (reporter_id, reported_user_id, card_id, reason, message) VALUES (?, ?, ?, ?, ?)',
            [reporterId, isUser ? userId : null, isCard ? cardId : null, reason, cleanMessage]
        )
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            const target = isCard ? 'cette carte' : 'ce joueur'
            return res.status(409).json({ error: `Tu as déjà signalé ${target}` })
        }
        throw err
    }

    notifyAdmins(reporterId, target, reason, cleanMessage)
        .catch(err => console.error('Envoi du mail de signalement échoué :', err))

    res.status(201).json({ ok: true })
})
