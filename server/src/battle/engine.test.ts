import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyAction, createBattle, getLegalActions, getPlayerView } from './engine.js';
import type { BattleCard, PlayerSetup } from './type.js';
import type { Talent } from './talent.js'

function card(id: number, hp = 80): BattleCard {
    return {
        id, name: `Carte ${id}`, maxHp: hp, hp,
        abilities: [
            { name: 'Coup', kind: 'attack', cost: 1, value: 20 },
            { name: 'Bouclier', kind: 'defense', cost: 1, value: 30 }
        ]
    }
}

function setup(userId: number, ids: number[], talent: Talent = 'guardian'): PlayerSetup {
    return {
        userId,
        talent,
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

test('une attaque retire des PV et passe la main', () => {
    const start = createBattle(twoPlayers(), 0)
    const state = applyAction(start, 0, { type: 'USE_ABILITY', index: 0 })
    assert.equal(state.players[1].cards[16].hp, 60)
    assert.equal(state.players[0].energy, 0)
    assert.equal(state.current, 1)
    assert.equal(state.players[1].energy, 1)
    assert.equal(state.turn, 2)
    assert.equal(start.players[1].cards[16].hp, 80)
})

test('le bouclier absorbe la prochaine attaque', () => {
    let state = createBattle(twoPlayers(), 0)
    state = applyAction(state, 0, { type: 'USE_ABILITY', index: 1 })
    state = applyAction(state, 1, { type: 'USE_ABILITY', index: 0 })
    assert.equal(state.players[0].cards[11].hp, 80)
    assert.equal(state.players[0].shield, 0)
})

test("le bouclier disparaît à la fin du tour adverse", () => {
    let state = createBattle(twoPlayers(), 0)
    state = applyAction(state, 0, { type: 'USE_ABILITY', index: 1 })
    assert.equal(state.players[0].shield, 45)
    state = applyAction(state, 1, { type: 'PASS' })
    assert.equal(state.players[0].shield, 0)
})

test('après un K.O., la réserve remonte et le joueur choisit sa carte', () => {
    let state = createBattle(twoPlayers(), 0)
    state.players[1].cards[16].hp = 20
    state = applyAction(state, 0, { type: 'USE_ABILITY', index: 0 })
    assert.equal(state.players[0].knockouts, 1)
    assert.equal(state.phase, 'choose_next')
    assert.equal(state.current, 1)
    assert.deepEqual(state.players[1].bench, [17, 18, 19])

    state = applyAction(state, 1, { type: 'CHOOSE_NEXT', cardId: 18 })
    assert.equal(state.players[1].active, 18)
    assert.deepEqual(state.players[1].bench, [17, 19])
    assert.equal(state.phase, 'action')
})

test('le troisième K.O. donne la victoire', () => {
    let state = createBattle(twoPlayers(), 0)
    state.players[0].knockouts = 2
    state.players[1].cards[16].hp = 20
    state = applyAction(state, 0, { type: 'USE_ABILITY', index: 0 })
    assert.equal(state.phase, 'ended')
    assert.equal(state.result, 0)
})

test('au tour 30, égalité parfaite = match nul', () => {
    let state = createBattle(twoPlayers(), 0)
    state.turn = 30
    state = applyAction(state, 0, { type: 'PASS' })
    assert.equal(state.phase, 'ended')
    assert.equal(state.result, 'draw')
})

test('au tour 30, le plus de PV restants gagne', () => {
    let state = createBattle(twoPlayers(), 0)
    state.turn = 30
    state.players[1].cards[20].hp = 10
    state = applyAction(state, 0, { type: 'PASS' })
    assert.equal(state.result, 0)
})

test('une action interdite est refusée', () => {
    const state = createBattle(twoPlayers(), 0)
    assert.throws(() => applyAction(state, 1, { type: 'PASS' }))
    assert.throws(() => applyAction(state, 0, { type: 'SWITCH', from: 11, to: 99 }))
})

test("la réserve de l'adversaire reste cachée", () => {
    const state = createBattle(twoPlayers(), 0)
    const view = getPlayerView(state, 0)
    assert.equal(view.opponent.reserveCount, 2)
    assert.ok(!('reserve' in view.opponent))
    assert.ok(!JSON.stringify(view).includes('Carte 19'))
    assert.equal(view.me.reserve.length, 2)
})

test("l'adversaire n'a aucune action pendant mon tour", () => {
    const state = createBattle(twoPlayers(), 0)
    assert.equal(getPlayerView(state, 0).yourTurn, true)
    assert.deepEqual(getPlayerView(state, 1).legalActions, [])
})

test('un combat complet se termine', () => {
    let state = createBattle(twoPlayers(), 0)
    while (state.phase !== 'ended') {
        const actions = getLegalActions(state, state.current)
        const action = actions.find(a => a.type === 'USE_ABILITY' && a.index === 0)
            ?? actions.find(a => a.type === 'CHOOSE_NEXT')
            ?? actions[0]
        state = applyAction(state, state.current, action)
    }
    assert.ok(state.turn <= 30)
    assert.equal(state.result, 0)
})

test('striker ajoute 10 dégâts aux attaques', () => {
    const state = createBattle([setup(1, [11, 12, 13, 14, 15], 'striker'), setup(2, [16, 17, 18, 19, 20])], 0)
    const next = applyAction(state, 0, { type: 'USE_ABILITY', index: 0 })
    assert.equal(next.players[1].cards[16].hp, 50)
})

test('energizer donne 1 énergie de plus au départ', () => {
    const energizer = setup(1, [11, 12, 13, 14, 15], 'energizer')
    const other = setup(2, [16, 17, 18, 19, 20])

    assert.equal(createBattle([energizer, other], 0).players[0].energy, 2)

    let state = createBattle([energizer, other], 1)
    assert.equal(state.players[0].energy, 1)
    state = applyAction(state, 1, { type: 'PASS' })
    assert.equal(state.players[0].energy, 2)
})
