import type { ErrorCode } from '../shared/protocol.js'

export class BattleError extends Error {
    code: ErrorCode

    constructor(code: ErrorCode, message: string) {
        super(message)
        this.code = code
    }
}