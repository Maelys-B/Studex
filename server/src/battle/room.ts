import type { BattleSnapshot, ErrorCode, ServerMessage } from '../shared/protocol.js'
import type { Action, ActionResult, BattleState, PlayerIndex, PlayerSetup, PlayerView } from '../shared/type.js'
import { applyAction, createBattle, forfeit, getPlayerView } from './engine.js'
import { createRandom, drawFirstPlayer } from './random.js'

export type Timings = {
    turnMs: number,
    reconnectMs: number,
    botDelayMs: number
}

export const DEFAULT_TIMINGS: Timings = {
    turnMs: 30000,
    reconnectMs: 60000,
    botDelayMs: 1000
}

export type ChooseAction = (view: PlayerView, random: () => number) => Action

export type Participant = 
    | { kind: 'human', name: string, setup: PlayerSetup }
    | { kind: 'bot', name: string, setup: PlayerSetup, chooseAction: ChooseAction }

export type CreateRoom = (playerA: Participant, playerB: Participant) => string

export type RoomOptions = {
    id: string,
    seed: number,
    timings: Timings,
    send: (userId: number, message: ServerMessage) => void,
    onEnd: () => void
}

const INDEXES: PlayerIndex[] = [0, 1]

export class Room {
    readonly players: [Participant, Participant]
    private options: RoomOptions
    private state: BattleState
    private random: () => number
    private seq = 0
    private botTimer?: NodeJS.Timeout
    private turnTimer?: NodeJS.Timeout
    private turnEndsAt = 0
    private awayTimers = new Map<PlayerIndex, NodeJS.Timeout>()

    constructor(players: [Participant, Participant], options: RoomOptions) {
        this.players = players
        this.options = options
        this.random = createRandom(options.seed)
        this.state = createBattle([players[0].setup, players[1].setup], drawFirstPlayer(options.seed))
    }

    start() {
        this.startTurn()
        for (const player of INDEXES) {
            this.sendState(player)
        }
    }

    play(player: PlayerIndex, seq: number, action: Action): ErrorCode | null {
        if (seq !== this.seq) return 'STALE_ACTION'

        let result: ActionResult
        try {
            result = applyAction(this.state, player, action)
        } catch {
            return 'ILLEGAL_ACTION'
        }
        this.update(result)
        return null
    }

    forfeit(player: PlayerIndex) {
        if (this.state.phase === 'ended') return
        this.update(forfeit(this.state, player))
    }

    connect(player: PlayerIndex) {
        clearTimeout(this.awayTimers.get(player))
        this.awayTimers.delete(player)
        this.sendState(player)
    }

    disconnect(player: PlayerIndex) {
        if (this.state.phase === 'ended') return
        clearTimeout(this.awayTimers.get(player))
        this.awayTimers.set(player, setTimeout(() => this.forfeit(player), this.options.timings.reconnectMs))
    }

    sendState(player: PlayerIndex) {
        const opponentName = this.players[player === 0 ? 1 : 0].name
        this.sendTo(player, { type: 'BATTLE_STATE', opponentName, battle: this.snapshot(player) })
    }

    sendTo(player: PlayerIndex, message: ServerMessage) {
        const participant = this.players[player]
        if (participant.kind === 'human') {
            this.options.send(participant.setup.userId, message)
        }
    }

    private update(result: ActionResult) {
        this.state = result.state
        this.seq++
        this.stopTurn()

        if (this.state.phase === 'ended') {
            this.stopAwayTimers()
        } else {
            this.startTurn()
        }

        for (const player of INDEXES) {
            this.sendTo(player, { type: 'BATTLE_UPDATE', battle: this.snapshot(player), events: result.events })
        }

        if (this.state.phase === 'ended') {
            this.options.onEnd()
        }
    }

    private startTurn() {
        const { turnMs } = this.options.timings
        this.turnEndsAt = Date.now() + turnMs
        this.turnTimer = setTimeout(() => this.playDefault(), turnMs)
        this.scheduleBot()
    }

    private stopTurn() {
        clearTimeout(this.turnTimer)
        clearTimeout(this.botTimer)
        this.turnEndsAt = 0
    }

    private stopAwayTimers() {
        for (const timer of this.awayTimers.values()) {
            clearTimeout(timer)
        }
        this.awayTimers.clear()
    }

    private playDefault() {
        const player = this.state.current
        const { legalActions } = getPlayerView(this.state, player)
        this.play(player, this.seq, legalActions[0])
    }
    
    private scheduleBot() {
        const player = this.state.current
        const participant = this.players[player]

        if (participant.kind !== 'bot') return

        this.botTimer = setTimeout(() => {
            const view = getPlayerView(this.state, player)
            let error: ErrorCode | null = 'ILLEGAL_ACTION'

            try {
                error = this.play(player, this.seq, participant.chooseAction(view, this.random))
            } catch (err) {
                console.error(`Bot ${participant.name} en erreur`, err)
            }
            
            if (error) this.playDefault()
        }, this.options.timings.botDelayMs)
    }

    private snapshot(player: PlayerIndex): BattleSnapshot {
        return {
            battleId: this.options.id,
            seq: this.seq,
            view: getPlayerView(this.state, player),
            timeLeftMs: Math.max(0, this.turnEndsAt - Date.now())
        }
    }
}