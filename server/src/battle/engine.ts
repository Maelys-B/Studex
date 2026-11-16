import { assertNuxtCompatibility } from 'nuxt/kit';
import type { BattleState, PlayerIndex, PlayerSetup, PlayerState, Action } from './type.js'

export const MAX_TURNS = 30
export const KOS_TO_WIN = 3

function createPlayer(setup: PlayerSetup): PlayerState {
    return {
        userId: setup.userId,
        cards: Object.fromEntries(setup.cards.map(card => [card.id, {...card}])),
        active: setup.active,
        bench: [...setup.bench],
        reserve: [...setup.reserve],
        energy: 0,
        shield: 0,
        knockouts: 0
    }
}

export function createBattle(setups: [PlayerSetup, PlayerSetup], first: PlayerIndex): BattleState {
    const players: [PlayerState, PlayerState] = [createPlayer(setups[0]), createPlayer(setups[1])]
    players[first].energy = 1
    return { players, current: first, turn: 1, phase: 'action', result: null}
}

export function getLegalActions(state: BattleState, player: PlayerIndex): Action[] {
    if (state.phase === 'ended' || state.current !== player) {
        return []
    }

    const me = state.players[player]

    if (state.phase === 'choose_next') {
        return me.bench.map((cardId): Action => ({ type: 'CHOOSE_NEXT', cardId}))
    }

    const actions: Action[] = [{ type: 'PASS' }]

    me.cards[me.active].abilities.forEach((ability, index) => {
        if (me.energy >= ability.cost) {
            actions.push({ type: 'USE_ABILITY', index: index as 0 | 1 })
        }
    })

    for (const benchId of me.bench) {
        actions.push({ type: 'SWITCH', from: me.active, to: benchId})
        for (const reserveId of me.reserve) {
            actions.push({ type: 'SWITCH', from: benchId, to: reserveId })
        }
    }

    return actions
}