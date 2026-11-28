import type { TradeOffer } from '../repositories/trade.repository.js'

export const MAX_CARDS_PER_SIDE = 10
export const MAX_QUANTITY = 99
export const MAX_COINS = 1_000_000

export type OfferCard = { cardId: number, quantity: number }
export type OfferSide = { coins: number, cards: OfferCard[] }
export type OfferInput = { give: OfferSide, receive: OfferSide }

function validateSide(raw: any, label: string): OfferSide | string {
    const coins = raw?.coins ?? 0
    const cards = raw?.cards ?? []

    if (!Number.isInteger(coins) || coins < 0 || coins > MAX_COINS) return `Nombre de coins ${label} invalide`
    if (!Array.isArray(cards)) return `Liste de cartes ${label} invalide`
    if (cards.length > MAX_CARDS_PER_SIDE) return `${MAX_CARDS_PER_SIDE} cartes différentes maximum ${label}`

    const seen = new Set<number>()
    const parsed: OfferCard[] = []
    for (const card of cards) {
        const cardId = card?.cardId
        const quantity = card?.quantity ?? 1

        if (!Number.isInteger(cardId)) return `Identifiant de carte ${label} invalide`
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return `Quantité de carte ${label} invalide`
        if (seen.has(cardId)) return `La même carte apparaît deux fois ${label}`

        seen.add(cardId)
        parsed.push({ cardId, quantity })
    }

    return { coins, cards: parsed }
}

export function validateOffer(body: any): OfferInput | string {
    const give = validateSide(body?.give, 'à donner')
    if (typeof give === 'string') return give

    const receive = validateSide(body?.receive, 'à recevoir')
    if (typeof receive === 'string') return receive

    const isEmpty = (side: OfferSide) => side.coins === 0 && side.cards.length === 0
    if (isEmpty(give) && isEmpty(receive)) return "L'échange est vide"

    return { give, receive }
}

export function buildTradeOffer(input: OfferInput, actorId: number, otherId: number, initiatorId: number): TradeOffer {
    const actorIsInitiator = actorId === initiatorId

    return {
        initiator_coins: actorIsInitiator ? input.give.coins : input.receive.coins,
        partner_coins: actorIsInitiator ? input.receive.coins : input.give.coins,
        items: [
            ...input.give.cards.map(card => ({ giver_id: actorId, card_id: card.cardId, quantity: card.quantity })),
            ...input.receive.cards.map(card => ({ giver_id: otherId, card_id: card.cardId, quantity: card.quantity })),
        ],
    }
}
