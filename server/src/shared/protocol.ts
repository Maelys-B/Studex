import type { Action, BattleEvent, PlayerView } from './type.js'

export type Lineup = {
    active: number,
    bench: [number, number]
}

export type ClientMessage =
    | { type: 'AUTH', token: string }
    | { type: 'JOIN_QUEUE', lineup: Lineup } 
    | { type: 'LEAVE_QUEUE' }
    | { type: 'PLAY_BOT', botId: string, lineup: Lineup }
    | { type: 'ACTION', battleId: string, seq: number, action: Action }
    | { type: 'FORFEIT', battleId: string }

export type ErrorCode = 
    | 'BAD_MESSAGE'
    | 'UNAUTHORIZED'
    | 'INVALID_LINEUP'
    | 'ALREADY_BUSY'
    | 'UNKNOWN_BOT'
    | 'UNKNOWN_BATTLE'
    | 'STALE_ACTION'
    | 'ILLEGAL_ACTION'
    | 'NOT_READY'
    | 'SERVER_ERROR'

export type BattleSnapshot = {
    battleId: string,
    seq: number,
    view: PlayerView,
    timeLeftMs: number
}

export type ServerMessage =
    | { type: 'AUTH_OK', userId: number }
    | { type: 'QUEUE_JOINED' }
    | { type: 'QUEUE_LEFT' }
    | { type: 'BATTLE_STATE', opponentName: string, battle: BattleSnapshot }
    | { type: 'BATTLE_UPDATE', battle: BattleSnapshot, events: BattleEvent[] }
    | { type: 'OPPONENT_CONNECTION', battleId: string, connected: boolean }
    | { type: 'REPLACED' }
    | { type: 'ERROR', code: ErrorCode, message: string }