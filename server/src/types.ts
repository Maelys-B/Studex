export type Rarity = 'commun' | 'uncommun' | 'rare' | 'epic' | 'legendary'

export type CardKind = 'collection' | 'battle' | 'student'

export type Attack = {
    name: string,
    cost: number,
    damage: number,
    description: string
}

export type Card = {
    readonly id: number,
    name: string,
    subtitle?: string,
    description?: string,
    image?: string,
    hp?: number,
    attacks?: Attack[],
    color?: string,
    rarity: Rarity,
    type: CardKind,
}

export type BoosterContent = {
    collection: [Card, Card, Card],
    battle: Card,
    student: Card
}

export type BoosterState = {
    stored: number,
    lastGainedAt: number,
}
