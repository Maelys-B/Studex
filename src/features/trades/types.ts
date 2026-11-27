import type { Card } from '../boosters/types'

export type TradeStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'

export type TradeCard = Pick<Card, 'id' | 'name' | 'image' | 'rarity'> & { quantity: number }

export type TradeSide = { coins: number, cards: TradeCard[] }

export type Trade = {
    id: number,
    status: TradeStatus,
    updated_at: string,
    isInitiator: boolean,
    myTurn: boolean,
    partner: { id: number, username: string },
    give: TradeSide,
    receive: TradeSide
}

export type OfferCard = { cardId: number, quantity: number }

export type OfferSide = { coins: number, cards: OfferCard[] }

export type Offer = { give: OfferSide, receive: OfferSide }
