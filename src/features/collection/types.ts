import type { Card } from '../boosters/types'

export type OwnedCard = Card & {
    quantity: number,
    obtained_at: string
}