import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createBattle } from './engine.js'
import type { BattleCard, PlayerSetup } from './type.js'

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