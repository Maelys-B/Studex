import type { ReportReason } from '../generated/prisma/client.js'
import { HttpError } from '../errors/HttpError.js'
import { isUniqueViolation } from '../lib/prisma.js'
import { cardRepository } from '../repositories/card.repository.js'
import { reportRepository } from '../repositories/report.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { transporter, MAIL_FROM } from './mailer.js'

const REASON_LABELS: Record<ReportReason, string> = {
    inappropriate: 'Contenu inapproprié',
    offensive: 'Contenu offensant',
    harassment: 'Harcèlement',
    impersonation: "Usurpation d'identité",
    spam: 'Spam',
    other: 'Autre',
}

async function notifyAdmins(reporterId: number, target: string, reason: ReportReason, message: string | null) {
    const admins = await userRepository.findAdminEmails()
    if (admins.length === 0) return

    const reporter = (await userRepository.findUsername(reporterId))?.username ?? `#${reporterId}`

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

async function describeCard(reporterId: number, cardId: number) {
    const card = await cardRepository.findWithCreator(cardId)
    if (!card) throw new HttpError(404, 'Carte introuvable')
    if (card.created_by === null) {
        throw new HttpError(400, 'Seules les cartes créées par des joueurs peuvent être signalées')
    }
    if (card.created_by === reporterId) throw new HttpError(400, 'Tu ne peux pas signaler ta propre carte')

    return `la carte « ${card.name} » (id ${card.id}) de ${card.creator?.username}`
}

async function describeUser(reporterId: number, userId: number) {
    if (userId === reporterId) throw new HttpError(400, 'Tu ne peux pas te signaler toi-même')

    const user = await userRepository.findUsername(userId)
    if (!user) throw new HttpError(404, 'Joueur introuvable')

    return `le joueur ${user.username} (id ${user.id})`
}

export type ReportTarget = { cardId: number } | { userId: number }

export const reportService = {
    async create(reporterId: number, target: ReportTarget, reason: ReportReason, message: string | null) {
        const isCard = 'cardId' in target
        const description = isCard
            ? await describeCard(reporterId, target.cardId)
            : await describeUser(reporterId, target.userId)

        try {
            await reportRepository.create({
                reporter_id: reporterId,
                reported_user_id: isCard ? null : target.userId,
                card_id: isCard ? target.cardId : null,
                reason,
                message,
            })
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw new HttpError(409, `Tu as déjà signalé ${isCard ? 'cette carte' : 'ce joueur'}`)
            }
            throw err
        }

        notifyAdmins(reporterId, description, reason, message)
            .catch(err => console.error('Envoi du mail de signalement échoué :', err))
    },
}
