import { prisma, type Db } from '../lib/prisma.js'

export const collectionRepository = {
    findByUser(userId: number) {
        return prisma.userCard.findMany({
            where: { user_id: userId },
            include: { card: { include: { attacks: { orderBy: { slot: 'asc' } } } } },
            orderBy: { obtained_at: 'desc' },
        })
    },

    deleteAll(db: Db, userId: number, cardIds: number[]) {
        return db.userCard.deleteMany({ where: { user_id: userId, card_id: { in: cardIds } } })
    },

    decrement(db: Db, userId: number, cardIds: number[]) {
        return db.userCard.updateMany({
            where: { user_id: userId, card_id: { in: cardIds } },
            data: { quantity: { decrement: 1 } },
        })
    },

    deleteEmpty(db: Db, userId: number, cardIds: number[]) {
        return db.userCard.deleteMany({ where: { user_id: userId, card_id: { in: cardIds }, quantity: 0 } })
    },
}
