import { TALENTS } from './talent.js';
import type { Action, BattleState, PlayerIndex, PlayerSetup, PlayerState, PlayerView, PublicPlayer } from './type.js';

export const MAX_TURNS = 30
export const KOS_TO_WIN = 3

function createPlayer(setup: PlayerSetup): PlayerState {
    return {
        userId: setup.userId,
        cards: Object.fromEntries(setup.cards.map(card => [card.id, {...card}])),
        active: setup.active,
        bench: [...setup.bench],
        reserve: [...setup.reserve],
        energy: TALENTS[setup.talent].startEnergy ?? 0,
        shield: 0,
        knockouts: 0,
        talent: setup.talent
    }
}

export function createBattle(setups: [PlayerSetup, PlayerSetup], first: PlayerIndex): BattleState {
    const players: [PlayerState, PlayerState] = [createPlayer(setups[0]), createPlayer(setups[1])]
    players[first].energy += 1
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

function opponent(player: PlayerIndex): PlayerIndex {
    return player ===  0 ? 1 : 0
}

function actionKey(action: Action): string {
    switch (action.type) {
        case 'USE_ABILITY': return `USE_ABILITY:${action.index}`
        case 'SWITCH': return `SWITCH:${action.from}:${action.to}`
        case 'PASS': return 'PASS'
        case 'CHOOSE_NEXT': return `CHOOSE_NEXT:${action.cardId}`
    }
}

function totalHp(player: PlayerState): number {
    return Object.values(player.cards).reduce((sum, card) => sum + card.hp, 0)
}

function decideWinner(state: BattleState): PlayerIndex | 'draw' {
    const [a, b] = state.players
    if (a.knockouts !== b.knockouts) {
        return a.knockouts > b.knockouts ? 0 : 1
    }
    const hpA = totalHp(a)
    const hpB = totalHp(b)
    if (hpA !== hpB) {
        return hpA > hpB ? 0 : 1
    }
    return 'draw'
}

function finish(state: BattleState, result: PlayerIndex | 'draw') {
    state.phase = 'ended'
    state.result = result
}

function endTurn(state: BattleState) {
    const next = opponent(state.current)
    state.players[next].shield = 0
    if (state.turn >= MAX_TURNS) {
        finish(state, decideWinner(state))
        return
    }
    state.turn++
    state.current = next
    state.players[next].energy++
    state.phase = 'action'
}

function switchCards(me: PlayerState, from: number, to: number) {
    if (from === me.active) {
        me.bench = me.bench.map(id => (id === to ? from : id))
        me.active = to
        me.shield = 0
    } else {
        me.bench = me.bench.map(id => (id === to ? from : id))
        me.reserve = me.reserve.map(id => (id === to ? from : id))
    }
}

function useAbility(state: BattleState, player: PlayerIndex, index: 0 | 1) {
    const me = state.players[player]
    const foe = state.players[opponent(player)]
    const effect = TALENTS[me.talent]
    const ability = me.cards[me.active].abilities[index]
    me.energy -= ability.cost

    if (ability.kind === 'defense') {
        me.shield = ability.value + (effect.defenseBonus ?? 0)
        endTurn(state)
        return
    }

    const damage = Math.max(0, ability.value + (effect.attackBonus ?? 0) - foe.shield)
    foe.shield = 0
    const target = foe.cards[foe.active]
    target.hp = Math.max(0, target.hp - damage)

    if (target.hp > 0) {
        endTurn(state)
        return
    }

    me.knockouts++
    if (me.knockouts >= KOS_TO_WIN) {
        finish(state, player)
        return
    }

    const fromReserve = foe.reserve.shift()
    if (fromReserve !== undefined) {
        foe.bench.push(fromReserve)
    }

    endTurn(state)
    if (state.phase === 'ended') {
        return
    }

    if (foe.bench.length > 1) {
        state.phase = 'choose_next'
    } else {
        foe.active = foe.bench[0]
        foe.bench = []
    }
}

export function applyAction(state: BattleState, player: PlayerIndex, action: Action): BattleState {
    const legal = getLegalActions(state, player).map(actionKey)
    if (!legal.includes(actionKey(action))) {
        throw new Error('Action interdite')
    }

    const next = structuredClone(state)
    const me = next.players[player]

    switch (action.type) {
        case 'USE_ABILITY':
            useAbility(next, player, action.index)
            break
        case 'SWITCH':
            switchCards(me, action.from, action.to)
            endTurn(next)
            break
        case 'PASS':
            endTurn(next)
            break
        case 'CHOOSE_NEXT':
            me.active = action.cardId
            me.bench = me.bench.filter(id => id !== action.cardId)
            next.phase = 'action'
            break
    }

    return next
}

function publicPlayer(player: PlayerState): PublicPlayer {
    return {
        userId: player.userId,
        active: player.cards[player.active],
        bench: player.bench.map(id => player.cards[id]),
        reserveCount: player.reserve.length,
        energy: player.energy,
        shield: player.shield,
        knockouts: player.knockouts,
        talent: player.talent
    }
}

export function getPlayerView(state: BattleState, player: PlayerIndex): PlayerView {
    const me = state.players[player]
    const foe = state.players[opponent(player)]
    return {
        you: player,
        turn: state.turn,
        maxTurns: MAX_TURNS,
        yourTurn: state.current === player && state.phase !== 'ended',
        phase: state.phase,
        result: state.result,
        me: { ...publicPlayer(me), reserve: me.reserve.map(id => me.cards[id]) },
        opponent: publicPlayer(foe),
        legalActions: getLegalActions(state, player)
    }
}