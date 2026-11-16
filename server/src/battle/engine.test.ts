import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createBattle, getLegalActions } from './engine.js'
import type { BattleCard, PlayerSetup } from './type.js'
import { act } from 'react';

function card(id: number, hp = 80): BattleCard {
    return {
        id, name: `Carte ${id}`, maxHp: hp, hp,
        abilities: [
            { name: 'Coup', kind: 'attack', cost: 1, value: 20 },
            { name: 'Bouclier', kind: 'defense', cost: 1, value: 30 }
        ]
    }
}

function setup(userId: number, ids: number[]): PlayerSetup {
    return {
        userId,
        cards: ids.map(id => card(id)),
        active: ids[0],
        bench: [ids[1], ids[2]],
        reserve: [ids[3], ids[4]]
    }
}

export const twoPlayers = (): [PlayerSetup, PlayerSetup] => 
    [setup(1, [11, 12, 13, 14, 15]), setup(2, [16, 17, 18, 19, 20])]

test('le premier joueur commence avec 1 énergie', () => {
    const state = createBattle(twoPlayers(), 1)
    assert.equal(state.current, 1)
    assert.equal(state.players[1].energy, 1)
    assert.equal(state.players[0].energy, 0)
})

test("aucune action quand ce n'est pas son tour", () => {
    const state = createBattle(twoPlayers(), 0)
    assert.deepEqual(getLegalActions(state, 1), [])
})

test('les capacités demandent assez d\' énergie', () => {
    const state = createBattle(twoPlayers(), 0)
    state.players[0].energy = 0
    const actions = getLegalActions(state, 0)
    assert.ok(!actions.some(a => a.type === 'USE_ABILITY'))
    assert.ok(actions.some(a => a.type === 'PASS'))
})

test('les échanges possibles au départ', () => {
    const state = createBattle(twoPlayers(), 0)
    const switches = getLegalActions(state, 0).filter(a => a.type === 'SWITCH')
    assert.equal(switches.length, 6)
    assert.deepEqual(switches[0], { type: 'SWITCH', from: 11, to: 12 })
})

test('après un K.O., seul le choix de la remplaçante est permis', () => {
    const state = createBattle(twoPlayers(), 0)
    state.phase = 'choose_next'
    assert.deepEqual(getLegalActions(state, 0), [
        { type: 'CHOOSE_NEXT', cardId: 12 },
        { type: 'CHOOSE_NEXT', cardId: 13 }
    ])
})