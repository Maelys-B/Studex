import type { BattleState, PlayerIndex, PlayerSetup, PlayerState } from './type.js'

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