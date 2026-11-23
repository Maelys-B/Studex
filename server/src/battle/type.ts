import type { Talent } from './talent.js'

export type PlayerIndex = 0 | 1

export type Ability = {
    name: string,
    kind: 'attack' | 'defense',
    cost: number,
    value: number

}

export type BattleCard = {
    id: number,
    name: string,
    maxHp: number,
    hp: number,
    abilities: [Ability, Ability]
}

export type PlayerState = {
    userId: number,
    cards: Record<number, BattleCard>,
    active: number,
    bench: number[],
    reserve: number[],
    energy: number,
    shield: number,
    knockouts: number,
    talent: Talent

}

export type BattleState = {
    players: [PlayerState, PlayerState],
    current: PlayerIndex,
    turn: number,
    phase: 'action' | 'choose_next' | 'ended',
    result: PlayerIndex | 'draw' | null

}

export type Action = 
    | { type: 'USE_ABILITY', index: 0 | 1 }
    | { type: 'SWITCH', from: number, to: number }
    | { type: 'PASS' }
    | { type: 'CHOOSE_NEXT', cardId: number}

export type PlayerSetup = {
    userId: number,
    cards: BattleCard[],
    active:number,
    bench: [number, number],
    reserve: [number, number],
    talent: Talent 
    
}

export type PublicPlayer = {
    userId: number,
    active: BattleCard,
    bench: BattleCard[],
    reserveCount: number,
    energy: number,
    shield: number,
    knockouts: number,
    talent: Talent
    
}

export type PlayerView = {
    you: PlayerIndex,
    turn: number,
    maxTurns: number,
    yourTurn: boolean,
    phase: BattleState['phase'],
    result: BattleState['result'],
    me: PublicPlayer & { reserve: BattleCard[] },
    opponent: PublicPlayer,
    legalActions: Action[]
    
}

export type BattleEvent = 
    | { type: 'DAMAGE', player: PlayerIndex, cardId: number, amount: number, absorbed: number }
    | { type: 'SHIELD', player: PlayerIndex, cardId: number, value: number }
    | { type: 'KO', player: PlayerIndex, cardId: number }
    | { type: 'RESERVE_UP', player: PlayerIndex, cardId: number }
    | { type: 'SWITCH', player: PlayerIndex, from: number, to: number }
    | { type: 'NEXT_ACTIVE', player: PlayerIndex, cardId: number}
    | { type: 'END', result: PlayerIndex | 'draw' }
    | { type: 'FORFEIT', player: PlayerIndex }

export type ActionResult = {
    state: BattleState,
    events: BattleEvent[]
}