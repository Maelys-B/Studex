import { HttpError } from '../errors/HttpError.js'
import { prisma } from '../lib/prisma.js'
import { collectionRepository } from '../repositories/collection.repository.js'
import { toAttack } from './card.service.js'

export const collectionService = {
    async list(userId: number) {
        const rows = await collectionRepository.findByUser(userId)

        return rows.map(({ card, quantity, obtained_at }) => ({
            id: card.id,
            name: card.name,
            position_collection: card.position_collection,
            subtitle: card.subtitle,
            description: card.description,
            image: card.image,
            hp: card.hp,
            color: card.color,
            rarity: card.rarity,
            type: card.type,
            avatar: card.avatar,
            quantity,
            obtained_at,
            can_report: card.created_by !== null && card.created_by !== userId,
            attacks: card.attacks.length > 0 ? card.attacks.map(toAttack) : undefined,
        }))
    },

    async remove(userId: number, cardIds: number[], all: boolean) {
        const { count } = await prisma.$transaction(async tx => {
            if (all) return collectionRepository.deleteAll(tx, userId, cardIds)

            const result = await collectionRepository.decrement(tx, userId, cardIds)
            if (result.count > 0) await collectionRepository.deleteEmpty(tx, userId, cardIds)
            return result
        })

        if (count === 0) throw new HttpError(404, 'Carte absente de la collection')
    },
}
