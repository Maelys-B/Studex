import type { Server } from 'node:http'
import { WebSocketServer, type WebSocket } from 'ws'
import { parseClientMessage } from './parseMessage.js'
import type { ClientMessage } from '../shared/protocol.js'
import { sendMessage, type Connections } from './connection.js'

const AUTH_DELAY_MS = 5000
const HEARTBEAT_MS = 30000
const MAX_MESSAGE_BYTES = 4096

export type SocketHandlers = {
    readToken: (token: string) => number | null,
    onConnect: (userId: number) => void,
    onMessage: (userId: number, message: ClientMessage) => void,
    onDisconnect: (userId: number) => void
}

export function startSocketServer(server: Server, connections: Connections, handlers: SocketHandlers) {
    const wss = new WebSocketServer({ server, path: '/ws', maxPayload: MAX_MESSAGE_BYTES })
    const alive = new WeakSet<WebSocket>()

    wss.on('connection', socket => {
        let userId: number | null = null
        const authTimer = setTimeout(() => socket.close(), AUTH_DELAY_MS)

        alive.add(socket)
        socket.on('pong', () => alive.add(socket))
        socket.on('error', () => socket.terminate())

        socket.on('message', data => {
            if (socket.readyState !== socket.OPEN) return

            const message = parseClientMessage(data.toString())
            if (!message) {
                sendMessage(socket, { type: 'ERROR', code: 'BAD_MESSAGE', message: 'Message invalide'})
                return
            }

            if (userId !== null) {
                handlers.onMessage(userId, message)
                return
            }

            const tokenUserId = message.type === 'AUTH' ? handlers.readToken(message.token) : null
            if (tokenUserId === null) {
                sendMessage(socket, { type: 'ERROR', code: 'UNAUTHORIZED', message: 'Veuillez vous reconnecter' })
                socket.close()
                return
            }

            clearTimeout(authTimer)
            userId = tokenUserId
            connections.add(userId, socket)
            sendMessage(socket, { type: 'AUTH_OK', userId })
            handlers.onConnect(userId)
        })

        socket.on('close', () => {
            clearTimeout(authTimer)
            if (userId !== null && connections.remove(userId, socket)) {
                handlers.onDisconnect(userId)
            }
        })
    })

    const heartbeat = setInterval(() => {
        for (const socket of wss.clients) {
            if (!alive.has(socket)) {
                socket.terminate()
                continue
            }
            alive.delete(socket)
            socket.ping()
        }
    }, HEARTBEAT_MS)

    wss.on('close', () => clearInterval(heartbeat))
    return wss
}