import { prisma, type Db } from '../lib/prisma.js'

export type TradeItemInput = { giver_id: number, card_id: number, quantity: number }

export type TradeOffer = {
    initiator_coins: number
    partner_coins: number
    items: TradeItemInput[]
}

const tradeDetails = {
    id: true,
    status: true,
    turn_user_id: true,
    initiator_coins: true,
    partner_coins: true,
    updated_at: true,
    initiator: { select: { id: true, username: true } },
    partner: { select: { id: true, username: true } },
    items: {
        select: {
            giver_id: true,
            quantity: true,
            card: { select: { id: true, name: true, image: true, rarity: true } },
        },
    },
} as const

export const tradeRepository = {
    create(initiatorId: number, partnerId: number, offer: TradeOffer) {
        return prisma.trade.create({
            data: {
                initiator_id: initiatorId,
                partner_id: partnerId,
                turn_user_id: partnerId,
                initiator_coins: offer.initiator_coins,
                partner_coins: offer.partner_coins,
                items: { create: offer.items },
            },
            select: tradeDetails,
        })
    },

    findById(db: Db, id: number) {
        return db.trade.findUnique({
            where: { id },
            include: { items: { select: { giver_id: true, card_id: true, quantity: true } } },
        })
    },

    findDetails(id: number) {
        return prisma.trade.findUnique({ where: { id }, select: tradeDetails })
    },

    findPendingForUser(userId: number) {
        return prisma.trade.findMany({
            where: { status: 'pending', OR: [{ initiator_id: userId }, { partner_id: userId }] },
            select: tradeDetails,
            orderBy: { updated_at: 'desc' },
        })
    },

    updateOffer(db: Db, id: number, turnUserId: number, nextTurnUserId: number, offer: TradeOffer) {
        return db.trade.updateMany({
            where: { id, status: 'pending', turn_user_id: turnUserId },
            data: {
                turn_user_id: nextTurnUserId,
                initiator_coins: offer.initiator_coins,
                partner_coins: offer.partner_coins,
            },
        })
    },

    async replaceItems(db: Db, tradeId: number, items: TradeItemInput[]) {
        await db.tradeItem.deleteMany({ where: { trade_id: tradeId } })
        await db.tradeItem.createMany({ data: items.map(item => ({ ...item, trade_id: tradeId })) })
    },

    closeOnTurn(db: Db, id: number, turnUserId: number, status: 'accepted' | 'declined') {
        return db.trade.updateMany({
            where: { id, status: 'pending', turn_user_id: turnUserId },
            data: { status },
        })
    },

    cancel(db: Db, id: number, userId: number) {
        return db.trade.updateMany({
            where: {
                id,
                status: 'pending',
                turn_user_id: { not: userId },
                OR: [{ initiator_id: userId }, { partner_id: userId }],
            },
            data: { status: 'cancelled' },
        })
    },
}
