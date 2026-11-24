import type { ClientMessage, Lineup } from '../shared/protocol.js'
import type { Action } from '../shared/type.js'

type Fields = Record<string, unknown>

function isObject(value: unknown): value is Fields {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isId(value: unknown): value is number {
    return Number.isInteger(value)
}

function isText(value: unknown): value is string {
    return typeof value === 'string' && value !== '' 
}

function parseLineup(value: unknown): Lineup | null {
    if (!isObject(value) || !isId(value.active)) return null
    if (!Array.isArray(value.bench) || value.bench.length !== 2) return null

    const [first, second] = value.bench
    if (!isId(first) || !isId(second)) return null
    return { active: value.active, bench: [first, second] }
}

function parseAction(value: unknown): Action | null {
    if (!isObject(value)) return null

    switch (value.type) {
        case 'PASS':
            return { type: 'PASS' }
        case 'USE_ABILITY':
            return value.index === 0 || value.index === 1 ? { type: 'USE_ABILITY', index: value.index } : null
        case 'SWITCH':
            return isId(value.from) && isId(value.to) ? { type: 'SWITCH', from: value.from, to: value.to } : null
        case 'CHOOSE_NEXT':
            return isId(value.cardId) ? { type: 'CHOOSE_NEXT', cardId: value.cardId } : null
        default:
            return null
    }
}

function parseFields(value: Fields): ClientMessage | null {
    switch (value.type) {
        case 'AUTH':
            return isText(value.token) ? { type: 'AUTH', token: value.token} : null
        case 'JOIN_QUEUE': {
            const lineup = parseLineup(value.lineup)
            return lineup && { type: 'JOIN_QUEUE', lineup }
        }
        case 'LEAVE_QUEUE':
            return { type: 'LEAVE_QUEUE' }
        case 'PLAY_BOT': {
            const lineup = parseLineup(value.lineup)
            return lineup && isText(value.botId) ? { type: 'PLAY_BOT', botId: value.botId, lineup } : null
        }
        case 'ACTION': {
            const action = parseAction(value.action)
            return action && isText(value.battleId) && isId(value.seq)
                ? { type: 'ACTION', battleId: value.battleId, seq: value.seq, action }
                : null
        }
        case 'FORFEIT':
            return isText(value.battleId) ? { type: 'FORFEIT', battleId: value.battleId } : null
        default: 
            return null
    }
}

export function parseClientMessage(raw: string): ClientMessage | null {
    try {
        const value: unknown = JSON.parse(raw)
        return isObject(value) ? parseFields(value) : null
    } catch {
        return null
    }
}