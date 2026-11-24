import { prisma, type Db } from '../lib/prisma.js'

export const collectionRepository = {
    findByUser(userId: number) {
        return prisma.userCard.findMany({
            where: { user_id: userId },
            include: { card: { include: { attacks: { orderBy: { slot: 'asc' } } } } },
            orderBy: { obtained_at: 'desc' },
        })
    },

    findOwnedRarity(db: Db, userId: number, cardId: number) {
        return db.userCard.findUnique({
            where: { user_id_card_id: { user_id: userId, card_id: cardId } },
            select: { card: { select: { rarity: true } } },
        })
    },

    removeCopies(db: Db, userId: number, cardId: number, count: number) {
        return db.userCard.updateMany({
            where: { user_id: userId, card_id: cardId, quantity: { gte: count } },
            data: { quantity: { decrement: count } },
        })
    },

    deleteEmpty(db: Db, userId: number, cardId: number) {
        return db.userCard.deleteMany({ where: { user_id: userId, card_id: cardId, quantity: 0 } })
    },
}
