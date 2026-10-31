export type Rarity = 'commun' | 'uncommun' | 'rare' | 'epic' | 'legendary'

export type CardKind = 'collection' | 'battle' | 'student'

export type CardStatus = 'pending' | 'approved' | 'rejected'

export type Attack = {
    name: string,
    cost: number,
    damage: number,
    description: string
}

export type Card = {
    readonly id: number,
    name: string,
    position_collection: number,
    subtitle?: string,
    description?: string,
    image?: string,
    hp?: number,
    attacks?: Attack[],
    color?: string,
    avatar?: Avatar,
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

export type BoosterStatus = {
    stored: number,
    max: number,
    serverNow: number,
    nextAt: number | null
}

export type Avatar = {
    skin: number,
    hair: number,
    eyes: number,
    mouth: number,
    outfit: number
}