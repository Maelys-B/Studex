import { DECK_SIZE, validateLineup } from '../shared/deck.js'
import type { Lineup } from '../shared/protocol.js'
import type { Talent } from '../shared/talent.js'
import type { Ability, BattleCard, PlayerSetup } from '../shared/type.js'

export type StoredCard = {
    id: number,
    name: string,
    hp: number | null,
    attacks: { name: string, kind: Ability['kind'], energy_cost: number, damage: number }[]
}

export function toBattleCards(cards: StoredCard[]): BattleCard[] {
    return cards.flatMap(card => {
        if (card.hp === null || card.attacks.length !== 2) return []

        const [first, second] = card.attacks.map(attack => ({
            name: attack.name,
            kind: attack.kind,
            cost: attack.energy_cost,
            value: attack.damage
        }))
        return [{ id: card.id, name: card.name, maxHp: card.hp, hp: card.hp, abilities: [first, second]}]
    })
}

export function shuffle<T>(items: T[], random: () => number): T[] {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

export function randomLineup(cards: BattleCard[], random: () => number): Lineup | null {
    const [active, first, second] = shuffle(cards.map(card => card.id), random)
    if (second === undefined) return null
    return {active, bench: [first, second]}
}

export function buildSetup(userId: number, talent: Talent, cards: BattleCard[], lineup: Lineup, random: () => number): PlayerSetup | string {
    const ids = cards.map(card => card.id)
    const error = validateLineup(ids, lineup.active, lineup.bench)
    if (error) return error

    const chosen = [lineup.active, ...lineup.bench]
    const reserve = shuffle(ids.filter(id => !chosen.includes(id)), random).slice(0, DECK_SIZE - chosen.length)
    if (reserve.length + chosen.length < DECK_SIZE) return `Il te faut au moins ${DECK_SIZE} cartes de combat`

    const deck = [...chosen, ...reserve]
    return {
        userId,
        talent,
        cards: cards.filter(card => deck.includes(card.id)),
        active: lineup.active,
        bench: lineup.bench,
        reserve: [reserve[0], reserve[1]]
    }
}