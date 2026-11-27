import { HttpError } from '../errors/HttpError.js'
import { prisma, type Db } from '../lib/prisma.js'
import { collectionRepository } from '../repositories/collection.repository.js'
import { friendshipRepository } from '../repositories/friendship.repository.js'
import { tradeRepository, type TradeOffer } from '../repositories/trade.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { collectionService } from './collection.service.js'
import { buildTradeOffer, type OfferInput } from './tradeLogic.js'

type TradeDetails = NonNullable<Awaited<ReturnType<typeof tradeRepository.findDetails>>>

async function assertCanGive(db: Db, offer: TradeOffer, userId: number, coins: number, isActor: boolean) {
    const who = isActor ? 'Tu n\'as' : 'Ton partenaire n\'a'

    const user = await userRepository.findCoins(db, userId)
    if (!user || user.coins < coins) throw new HttpError(409, `${who} pas assez de coins`)

    const cards = offer.items.filter(item => item.giver_id === userId)
    if (cards.length === 0) return

    const owned = await collectionRepository.findQuantities(db, userId, cards.map(card => card.card_id))
    for (const card of cards) {
        const quantity = owned.find(row => row.card_id === card.card_id)?.quantity ?? 0
        if (quantity < card.quantity) throw new HttpError(409, `${who} pas assez d'exemplaires d'une des cartes`)
    }
}

async function assertBothCanGive(db: Db, offer: TradeOffer, actorId: number, otherId: number, initiatorId: number) {
    const coinsOf = (userId: number) => userId === initiatorId ? offer.initiator_coins : offer.partner_coins
    await assertCanGive(db, offer, actorId, coinsOf(actorId), true)
    await assertCanGive(db, offer, otherId, coinsOf(otherId), false)
}

async function assertFriends(userId: number, partnerId: number) {
    if (partnerId === userId) throw new HttpError(400, 'Tu ne peux pas échanger avec toi-même')
    if (!(await userRepository.findUsername(partnerId))) throw new HttpError(404, 'Joueur introuvable')

    const [link] = await friendshipRepository.findBetween(userId, [partnerId])
    if (link?.status !== 'accepted') throw new HttpError(403, 'Tu ne peux échanger qu\'avec tes amis')
}

async function findTradeToAnswer(db: Db, tradeId: number, userId: number) {
    const trade = await tradeRepository.findById(db, tradeId)
    if (!trade || (trade.initiator_id !== userId && trade.partner_id !== userId)) {
        throw new HttpError(404, 'Échange introuvable')
    }
    if (trade.status !== 'pending') throw new HttpError(409, 'Cet échange est terminé')
    if (trade.turn_user_id !== userId) throw new HttpError(409, 'Ce n\'est pas ton tour de répondre')
    return trade
}

function toView(trade: TradeDetails, userId: number) {
    const isInitiator = trade.initiator.id === userId
    const cardsOf = (giverId: number) => trade.items
        .filter(item => item.giver_id === giverId)
        .map(item => ({ ...item.card, quantity: item.quantity }))
    const other = isInitiator ? trade.partner : trade.initiator

    return {
        id: trade.id,
        status: trade.status,
        updated_at: trade.updated_at,
        isInitiator,
        myTurn: trade.turn_user_id === userId,
        partner: other,
        give: { coins: isInitiator ? trade.initiator_coins : trade.partner_coins, cards: cardsOf(userId) },
        receive: { coins: isInitiator ? trade.partner_coins : trade.initiator_coins, cards: cardsOf(other.id) },
    }
}

export const tradeService = {
    async list(userId: number) {
        const trades = await tradeRepository.findPendingForUser(userId)
        return trades.map(trade => toView(trade, userId))
    },

    async get(userId: number, tradeId: number) {
        const trade = await tradeRepository.findDetails(tradeId)
        if (!trade || (trade.initiator.id !== userId && trade.partner.id !== userId)) {
            throw new HttpError(404, 'Échange introuvable')
        }
        return toView(trade, userId)
    },

    async partnerCollection(userId: number, partnerId: number) {
        await assertFriends(userId, partnerId)

        const cards = await collectionService.list(partnerId)
        return cards.map(({ can_report: _canReport, sell_price: _sellPrice, ...card }) => card)
    },

    async create(userId: number, partnerId: number, input: OfferInput) {
        await assertFriends(userId, partnerId)

        const offer = buildTradeOffer(input, userId, partnerId, userId)
        await assertBothCanGive(prisma, offer, userId, partnerId, userId)

        const trade = await tradeRepository.create(userId, partnerId, offer)
        return toView(trade, userId)
    },

    async counter(userId: number, tradeId: number, input: OfferInput) {
        await prisma.$transaction(async tx => {
            const trade = await findTradeToAnswer(tx, tradeId, userId)
            const otherId = trade.initiator_id === userId ? trade.partner_id : trade.initiator_id

            const offer = buildTradeOffer(input, userId, otherId, trade.initiator_id)
            await assertBothCanGive(tx, offer, userId, otherId, trade.initiator_id)

            const { count } = await tradeRepository.updateOffer(tx, tradeId, userId, otherId, offer)
            if (count === 0) throw new HttpError(409, 'L\'échange a changé entre-temps')
            await tradeRepository.replaceItems(tx, tradeId, offer.items)
        })
        return tradeService.get(userId, tradeId)
    },

    async accept(userId: number, tradeId: number) {
        await prisma.$transaction(async tx => {
            const trade = await findTradeToAnswer(tx, tradeId, userId)

            const { count } = await tradeRepository.closeOnTurn(tx, tradeId, userId, 'accepted')
            if (count === 0) throw new HttpError(409, 'L\'échange a changé entre-temps')

            for (const item of trade.items) {
                const receiverId = item.giver_id === trade.initiator_id ? trade.partner_id : trade.initiator_id

                const removed = await collectionRepository.removeCopies(tx, item.giver_id, item.card_id, item.quantity)
                if (removed.count === 0) throw new HttpError(409, 'Une des cartes n\'est plus disponible')
                await collectionRepository.deleteEmpty(tx, item.giver_id, item.card_id)
                await collectionRepository.addCopies(tx, receiverId, item.card_id, item.quantity)
            }

            const transfers = [
                { from: trade.initiator_id, to: trade.partner_id, amount: trade.initiator_coins },
                { from: trade.partner_id, to: trade.initiator_id, amount: trade.partner_coins },
            ]
            for (const { from, to, amount } of transfers) {
                if (amount === 0) continue
                const removed = await userRepository.removeCoins(tx, from, amount)
                if (removed.count === 0) throw new HttpError(409, 'Un des joueurs n\'a plus assez de coins')
                await userRepository.addCoins(tx, to, amount)
            }
        })
        return tradeService.get(userId, tradeId)
    },

    async decline(userId: number, tradeId: number) {
        const { count } = await tradeRepository.closeOnTurn(prisma, tradeId, userId, 'declined')
        if (count === 0) throw new HttpError(409, 'Impossible de refuser cet échange')
    },

    async cancel(userId: number, tradeId: number) {
        const { count } = await tradeRepository.cancel(prisma, tradeId, userId)
        if (count === 0) throw new HttpError(409, 'Impossible d\'annuler cet échange')
    },
}
