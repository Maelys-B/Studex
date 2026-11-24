import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseClientMessage } from './parseMessage.js'

const parse = (value: unknown) => parseClientMessage(JSON.stringify(value))

test('accepte les messages valides', () => {
    const lineup = { active: 1, bench: [2, 3] }
    const messages = [
        { type: 'AUTH', token: 'abc' },
        { type: 'JOIN_QUEUE', lineup },
        { type: 'LEAVE_QUEUE' },
        { type: 'PLAY_BOT', botId: 'random', lineup },
        { type: 'ACTION', battleId: 'b1', seq: 0, action: { type: 'PASS' } },
        { type: 'ACTION', battleId: 'b1', seq: 4, action: { type: 'USE_ABILITY', index: 1 } },
        { type: 'ACTION', battleId: 'b1', seq: 5, action: { type: 'SWITCH', from: 1, to: 2 } },
        { type: 'ACTION', battleId: 'b1', seq: 6, action: { type: 'CHOOSE_NEXT', cardId: 2 } },
        { type: 'FORFEIT', battleId: 'b1' }
    ]
    for (const message of messages) assert.deepEqual(parse(message), message)
})

test('refuse un texte qui n\'est pas un objet JSON', () => {
    for (const raw of ['', 'bonjour', 'null', '[]', '42', '{']) assert.equal(parseClientMessage(raw), null)
})

test('refuse les messages incomplets ou inconnus', () => {
    const messages = [
        {},
        { type: 'TRICHE' },
        { type: 'AUTH' },
        { type: 'JOIN_QUEUE', lineup: { active: 1, bench: [2] } },
        { type: 'JOIN_QUEUE', lineup: { active: '1', bench: [2, 3] } },
        { type: 'ACTION', battleId: 'b1', seq: 0, action: null },
        { type: 'ACTION', battleId: 'b1', seq: 0, action: { type: 'USE_ABILITY', index: 2 } },
        { type: 'ACTION', battleId: 'b1', action: { type: 'PASS' } }
    ]
    for (const message of messages) assert.equal(parse(message), null)
})

test('retire les champs en trop', () => {
    assert.deepEqual(parse({ type: 'LEAVE_QUEUE', userId: 1 }), { type: 'LEAVE_QUEUE' })
})
