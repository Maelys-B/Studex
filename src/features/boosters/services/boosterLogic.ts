import type { Card, CardKind, BoosterContent, Rarity, BoosterState } from '../types'

const TABLE_LUCK: Record<Rarity, number> = {
    commun: 60,
    uncommun: 25,
    rare: 10,
    epic: 4,
    legendary: 1
}

function rollRarity(): Rarity {
    const draw = Math.random() * 100

    if (draw < TABLE_LUCK.commun) {
        return 'commun'
    }

    if (draw < TABLE_LUCK.commun + TABLE_LUCK.uncommun) {
        return 'uncommun'
    }

    if (draw < TABLE_LUCK.commun + TABLE_LUCK.uncommun + TABLE_LUCK.rare) {
        return 'rare'
    }

    if (draw < TABLE_LUCK.commun + TABLE_LUCK.uncommun + TABLE_LUCK.rare + TABLE_LUCK.epic) {
        return 'epic'
    }

    return 'legendary'
}

const RARITY_RANK: Record<Rarity, number> = {
    commun: 0,
    uncommun: 1,
    rare: 2,
    epic: 3,
    legendary: 4
}

function pickRandom(pool: Card[], type: CardKind, rarity: Rarity): Card {
    const candidates = pool.filter(card => card.rarity === rarity && card.type === type)
    return candidates[Math.floor(Math.random() * candidates.length) ]
}

export function openBooster(pool: Card[]): BoosterContent {
    const rarities: Rarity[] = []
    rarities.push(rollRarity())
    rarities.push(rollRarity())
    rarities.push(rollRarity())
    rarities.sort((a, b) => RARITY_RANK[a] - RARITY_RANK[b])

    return {
        collection: [
            pickRandom(pool, 'collection', rarities[0]),
            pickRandom(pool, 'collection', rarities[1]),
            pickRandom(pool, 'collection', rarities[2])
        ],
        battle: pickRandom(pool, 'battle', rollRarity()),
        student: pickRandom(pool, 'student', rollRarity())
    }
}

export const MAX_BOOSTERS = 5
export const BOOSTER_INTERVAL_MS = 2 * 60 * 60 * 1000

export function  refillBoosters(state: BoosterState, now: number): BoosterState {
    if (state.stored >= MAX_BOOSTERS) return state

    const gained = Math.floor((now - state.lastGainedAt) / BOOSTER_INTERVAL_MS)
    if (gained <= 0) return state

    return {
        stored: Math.min(state.stored + gained, MAX_BOOSTERS),
        lastGainedAt: state.lastGainedAt + gained * BOOSTER_INTERVAL_MS
    }
}

export function consumeBooster(state: BoosterState, now: number): BoosterState | null {
    const current = refillBoosters(state, now)
    if (current.stored <= 0) return null

    return {
        stored: current.stored - 1,
        lastGainedAt: current.stored >= MAX_BOOSTERS ? now : current.lastGainedAt
    }
}


