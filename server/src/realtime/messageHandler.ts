import type { RoomManager } from '../battle/roomManager.js'
import { BattleError } from '../errors/BattleError.js'
import { battleService } from '../services/battle.service.js'
import type { ClientMessage, Lineup, ServerMessage } from '../shared/protocol.js'

type Send = (userId: number, message: ServerMessage) => void

export function createMessageHandler(rooms: RoomManager, send: Send) {
    async function playBot(userId: number, botId: string, lineup: Lineup) {
        if (rooms.isBusy(userId)) {
            send(userId, { type: 'ERROR', code: 'ALREADY_BUSY', message: 'Tu es déjà en combat'})
            return
        }

        try {
            const [player, bot] = await battleService.preparedBotBattle(userId, botId, lineup)
            rooms.createRoom(player, bot)
        } catch (err) {
            if (err instanceof BattleError) {
                send(userId, { type: 'ERROR', code: err.code, message: err.message })
                return
            }
            console.error('Impossible de lancer le combat', err)
            send(userId, { type: 'ERROR', code: 'SERVER_ERROR', message: 'Erreur serveur'})
        }
    }

    return (userId: number, message: ClientMessage) => {
        switch (message.type) {
            case 'PLAY_BOT':
                void playBot(userId, message.botId, message.lineup)
                break
            case 'ACTION':
                rooms.play(userId, message.battleId, message.seq, message.action)
                break
            case 'FORFEIT':
                rooms.forfeit(userId, message.battleId)
                break
        }
    }
}