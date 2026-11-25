import type { BattleSnapshot, ErrorCode, ServerMessage } from '../shared/protocol.js'
import type { Action, ActionResult, BattleState, PlayerIndex, PlayerSetup, PlayerView } from '../shared/type.js'
import { applyAction, createBattle, forfeit, getPlayerView } from './engine.js'
import { createRandom, drawFirstPlayer } from './random.js'

export const TURN_MS = 30000

export type ChooseAction = (view: PlayerView, random: () => number) => Action

export type Participant = 
    | { kind: 'human', name: string, setup: PlayerSetup }
    | { kind: 'bot', name: string, setup: PlayerSetup, chooseAction: ChooseAction }

export type CreateRoom = (playerA: Participant, playerB: Participant) => string

export type RoomOptions = {
    id: string,
    seed: number,
    botDelayMs: number,
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

    constructor(players: [Participant, Participant], options: RoomOptions) {
        this.players = players
        this.options = options
        this.random = createRandom(options.seed)
        this.state = createBattle([players[0].setup, players[1].setup], drawFirstPlayer(options.seed))
    }

    start() {
        for (const player of INDEXES) {
            this.sendState(player)
        }
        this.scheduleBot()
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
        clearTimeout(this.botTimer)
        this.state = result.state
        this.seq++

        for (const player of INDEXES) {
            this.sendTo(player, { type: 'BATTLE_UPDATE', battle: this.snapshot(player), events: result.events })
        }

        if (this.state.phase === 'ended') {
            this.options.onEnd()
        } else {
            this.scheduleBot()
        }
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

            if (error) this.play(player, this.seq, view.legalActions[0])
        }, this.options.botDelayMs)
    }

    private snapshot(player: PlayerIndex): BattleSnapshot {
        return {
            battleId: this.options.id,
            seq: this.seq,
            view: getPlayerView(this.state, player),
            timeLeftMs: TURN_MS
        }
    }
}