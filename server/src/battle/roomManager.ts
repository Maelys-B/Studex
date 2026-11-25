import { randomInt, randomUUID } from 'node:crypto'
import type { ErrorCode, ServerMessage } from '../shared/protocol.js'
import type { Action, PlayerIndex } from '../shared/type.js'
import { Room, type CreateRoom } from './room.js'

const BOT_DELAY_MS = 1000
const MAX_SEED = 2 ** 32

const ERROR_TEXTS: Partial<Record<ErrorCode, string>> = {
    UNKNOWN_BATTLE: 'Combat introuvable',
    STALE_ACTION: 'Le combat a déjà avancé',
    ILLEGAL_ACTION: 'Action interdite'
}

type Seat = { battleId: string, room: Room, player: PlayerIndex }

export class RoomManager {
    private seats = new Map<number, Seat>()
    private send: (userId: number, message: ServerMessage) => void
    private botDelayMs: number

    constructor(send: (userId: number, message: ServerMessage) => void, botDelayMs = BOT_DELAY_MS) {
        this.send = send
        this.botDelayMs = botDelayMs
    }

    createRoom: CreateRoom = (playerA, playerB) => {
        const players: [typeof playerA, typeof playerB] = [playerA, playerB]
        const humans = players.filter(p => p.kind === 'human').map(p => p.setup.userId)

        if (humans.some(userId => this.isBusy(userId))) throw new Error('Joueur déjà en combat')
        if (playerA.setup.userId === playerB.setup.userId) throw new Error('Un joueur ne peut pas se combattre')

        const battleId = randomUUID()
        const room = new Room(players, {
            id: battleId,
            seed: randomInt(MAX_SEED),
            botDelayMs: this.botDelayMs,
            send: this.send,
            onEnd: () => humans.forEach(userId => this.seats.delete(userId))

        })

        players.forEach((participant, index) => {
            if (participant.kind === ('human')) {
                this.seats.set(participant.setup.userId, { battleId, room, player: index as PlayerIndex })
            }
        })
        room.start()
        return battleId
    }

    isBusy(userId: number): boolean {
        return this.seats.has(userId)
    }

    play(userId: number, battleId: string, seq: number, action: Action) {
        const seat = this.findSeat(userId, battleId)
        if (!seat) return

        const error = seat.room.play(seat.player, seq, action)
        if (!error) return

        this.sendError(userId, error)
        seat.room.sendState(seat.player)
    }

    forfeit(userId: number, battleId: string) {
        const seat = this.findSeat(userId, battleId)
        if (seat) seat.room.forfeit(seat.player)
    }

    connect(userId: number) {
        const seat = this.seats.get(userId)
        if (!seat) return
        seat.room.sendState(seat.player)
        this.notifyOpponent(seat, true)
    }

    disconnect(userId: number) {
        const seat = this.seats.get(userId)
        if (seat) this.notifyOpponent(seat, false)
    }

    private notifyOpponent(seat: Seat, connected: boolean) {
        seat.room.sendTo(seat.player === 0 ? 1 : 0, { type: 'OPPONENT_CONNECTION', battleId: seat.battleId, connected })
    }

    private findSeat(userId: number, battleId: string): Seat | null {
        const seat = this.seats.get(userId)
        if (seat && seat.battleId === battleId) return seat
        this.sendError(userId, 'UNKNOWN_BATTLE')
        return null
    }

    private sendError(userId: number, code: ErrorCode) {
        this.send(userId, { type: 'ERROR', code, message: ERROR_TEXTS[code] ?? 'Erreur' })
    }
}