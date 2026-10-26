export type Rarity = 'commun' | 'uncommun' | 'rare' | 'epic' | 'legendary'

export type CardKind = 'collection' | 'battle' | 'student'

export type Card = {
    readonly id: number,
    name: string,
    subtitle?: string,
    description?: string,
    image?: string,
    color?: string,
    rarity: Rarity,
    type: CardKind,
}


export type BoosterContent = {
    collection: [Card, Card, Card],
    battle: Card,
    student: Card
}

// Réponse du serveur : le stock du joueur et l'heure du prochain booster
export type BoosterStatus = {
    stored: number,
    max: number,
    serverNow: number,
    nextAt: number | null,
}

export type BoosterState = {
    stored: number,
    lastGainedAt: number,

}