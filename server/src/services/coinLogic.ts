import type { Rarity } from '../types.js'

export const SELL_PRICE: Record<Rarity, number> = {
    common: 1,
    uncommon: 2,
    rare: 6,
    epic: 15,
    legendary: 60
}
