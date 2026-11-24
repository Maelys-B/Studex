import { HttpError } from '../errors/HttpError.js'
import { prisma } from '../lib/prisma.js'
import { collectionRepository } from '../repositories/collection.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { toAttack } from './card.service.js'
import { SELL_PRICE } from './coinLogic.js'

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
            sell_price: SELL_PRICE[card.rarity],
            attacks: card.attacks.length > 0 ? card.attacks.map(toAttack) : undefined,
        }))
    },

    async sell(userId: number, cardId: number, count: number) {
        return prisma.$transaction(async tx => {
            const owned = await collectionRepository.findOwnedRarity(tx, userId, cardId)
            if (!owned) throw new HttpError(404, 'Carte absente de la collection')

            const { count: updated } = await collectionRepository.removeCopies(tx, userId, cardId, count)
            if (updated === 0) throw new HttpError(409, 'Pas assez d\'exemplaires à vendre')
            await collectionRepository.deleteEmpty(tx, userId, cardId)

            const earned = SELL_PRICE[owned.card.rarity] * count
            const { coins } = await userRepository.addCoins(tx, userId, earned)
            return { earned, coins }
        })
    },
}
