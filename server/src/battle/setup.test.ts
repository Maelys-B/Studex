import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRandom } from './random.js'
import { buildSetup, randomLineup, toBattleCards, type StoredCard } from './setup.js'

function stored(id: number): StoredCard {
    return {
        id, name: `Carte ${id}`, hp: 80,
        attacks: [
            { name: 'Coup', kind: 'attack', energy_cost: 1, damage: 30 },
            { name: 'Garde', kind: 'defense', energy_cost: 2, damage: 20 }
        ]
    }
}

const cards = (count: number) => toBattleCards(Array.from({ length: count }, (_, i) => stored(i + 1)))

test('transforme une carte de la base en carte de combat', () => {
    assert.deepEqual(toBattleCards([stored(7)]), [{
        id: 7, name: 'Carte 7', maxHp: 80, hp: 80,
        abilities: [
            { name: 'Coup', kind: 'attack', cost: 1, value: 30 },
            { name: 'Garde', kind: 'defense', cost: 2, value: 20 }
        ]
    }])
})

test('ignore une carte sans points de vie ou sans deux capacités', () => {
    const broken: StoredCard[] = [{ ...stored(1), hp: null }, { ...stored(2), attacks: [stored(2).attacks[0]] }]
    assert.deepEqual(toBattleCards(broken), [])
})

test('garde les cartes de départ et tire deux cartes de réserve', () => {
    for (let seed = 0; seed < 50; seed++) {
        const setup = buildSetup(1, 'striker', cards(8), { active: 3, bench: [5, 7] }, createRandom(seed))
        assert.ok(typeof setup !== 'string')
        assert.equal(setup.active, 3)
        assert.deepEqual(setup.bench, [5, 7])
        assert.equal(setup.cards.length, 5)
        assert.equal(new Set([setup.active, ...setup.bench, ...setup.reserve]).size, 5)
        assert.ok(setup.reserve.every(id => id >= 1 && id <= 8))
    }
})

test('refuse des cartes de départ invalides ou un deck trop petit', () => {
    const random = createRandom(1)
    assert.equal(typeof buildSetup(1, 'striker', cards(8), { active: 3, bench: [3, 7] }, random), 'string')
    assert.equal(typeof buildSetup(1, 'striker', cards(8), { active: 3, bench: [5, 99] }, random), 'string')
    assert.equal(buildSetup(1, 'striker', cards(4), { active: 1, bench: [2, 3] }, random), 'Il te faut au moins 5 cartes de combat')
})

test('tire trois cartes de départ différentes pour le bot', () => {
    const lineup = randomLineup(cards(10), createRandom(3))
    assert.ok(lineup)
    assert.equal(new Set([lineup.active, ...lineup.bench]).size, 3)
    assert.equal(randomLineup(cards(2), createRandom(3)), null)
})
