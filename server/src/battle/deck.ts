export const DECK_SIZE = 5
export const BENCH_SIZE = 2

export type DeckCard = {
    id: number,
    type: 'collection' | 'battle' | 'student'
}

export function validateDeck(cardIds: unknown, owned: DeckCard[]): string | null {
    if (!Array.isArray(cardIds) || !cardIds.every(Number.isInteger)) return 'Deck invalide'
    if (cardIds.length !== DECK_SIZE) return `Le deck doit contenir ${DECK_SIZE} cartes`
    if (new Set(cardIds).size !== DECK_SIZE) return 'Le deck ne peut pas contenir deux fois la même carte'

    for (const id of cardIds) {
        const card = owned.find(c => c.id === id)
        if (!card) return 'Le deck contient une carte que tu ne possèdes pas'
        if (card.type !== 'battle') return 'Seules les cartes de combat peuvent être utilisées'
    }
    return null
}

export function validateLineup(deck: number[], active: unknown, bench: unknown): string | null {
    if (!Number.isInteger(active) || !Array.isArray(bench) || bench.length !== BENCH_SIZE) return 'Cartes de départ invalides'

    const chosen = [active, ...bench]
    if (new Set(chosen).size !== chosen.length) return 'Les cartes de départ doivent être différentes'
    if (!chosen.every(id => deck.includes(id))) return 'Les cartes de départ doivent venir du deck'
    return null
}