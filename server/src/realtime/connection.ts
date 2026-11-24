import type { WebSocket } from 'ws'
import type { ServerMessage } from '../shared/protocol.js'

export function sendMessage(socket: WebSocket, message: ServerMessage) {
    if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(message))
    }
}

export class Connections {
    private sockets = new Map<number, WebSocket>()

    add(userId: number, socket: WebSocket) {
        const previous = this.sockets.get(userId)
        this.sockets.set(userId, socket)
        if (previous) {
            sendMessage(previous, { type: 'REPLACED'})
            previous.close()
        }
    }

    remove(userId: number, socket: WebSocket): boolean {
        if (this.sockets.get(userId) !== socket) {
            return false
        }
        this.sockets.delete(userId)
        return true
    }

    send(userId: number, message: ServerMessage) {
        const socket = this.sockets.get(userId)
        if (socket) {
            sendMessage(socket, message)
        }
    }
    
    isConnected(userId: number): boolean {
        return this.sockets.has(userId)
    }
}