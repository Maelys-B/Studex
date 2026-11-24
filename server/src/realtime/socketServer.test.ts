import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { test, type TestContext } from 'node:test'
import { WebSocket } from 'ws'
import type { ServerMessage } from '../shared/protocol.js'
import { Connections } from './connection.js'
import { startSocketServer } from './socketServer.js'

async function start(t: TestContext) {
    const log: string[] = []
    const server = createServer()
    const connections = new Connections()
    const wss = startSocketServer(server, connections, {
        readToken: token => (token === 'lea' ? 1 : null),
        onConnect: id => log.push(`connect ${id}`),
        onMessage: (id, message) => log.push(`${message.type} ${id}`),
        onDisconnect: id => log.push(`disconnect ${id}`)
    })
    server.listen(0)
    await once(server, 'listening')
    t.after(() => {
        for (const client of wss.clients) client.terminate()
        wss.close()
        server.close()
    })
    const { port } = server.address() as AddressInfo
    return { log, connections, url: `ws://localhost:${port}/ws` }
}

async function open(url: string) {
    const socket = new WebSocket(url)
    const received: ServerMessage[] = []
    socket.on('message', data => received.push(JSON.parse(data.toString())))
    await once(socket, 'open')
    return { socket, received, send: (value: unknown) => socket.send(JSON.stringify(value)) }
}

async function waitFor(condition: () => boolean) {
    const limit = Date.now() + 2000
    while (!condition()) {
        if (Date.now() > limit) assert.fail('Délai dépassé')
        await new Promise(resolve => setTimeout(resolve, 5))
    }
}

test('connecte un joueur avec un token valide', async t => {
    const { url, log, connections } = await start(t)
    const lea = await open(url)
    lea.send({ type: 'AUTH', token: 'lea' })
    await waitFor(() => lea.received.length === 1)
    assert.deepEqual(lea.received[0], { type: 'AUTH_OK', userId: 1 })

    lea.send({ type: 'LEAVE_QUEUE' })
    await waitFor(() => log.length === 2)
    assert.deepEqual(log, ['connect 1', 'LEAVE_QUEUE 1'])

    lea.socket.close()
    await waitFor(() => log.length === 3)
    assert.equal(log[2], 'disconnect 1')
    assert.equal(connections.isConnected(1), false)
})

test('ferme la connexion sans token valide au premier message', async t => {
    const { url, log } = await start(t)
    for (const message of [{ type: 'AUTH', token: 'faux' }, { type: 'LEAVE_QUEUE' }]) {
        const client = await open(url)
        client.send(message)
        await once(client.socket, 'close')
        assert.equal(client.received[0].type === 'ERROR' && client.received[0].code, 'UNAUTHORIZED')
    }
    assert.deepEqual(log, [])
})

test('signale un message invalide sans fermer la connexion', async t => {
    const { url } = await start(t)
    const lea = await open(url)
    lea.send({ type: 'AUTH', token: 'lea' })
    lea.send({ type: 'TRICHE' })
    await waitFor(() => lea.received.length === 2)
    assert.equal(lea.received[1].type === 'ERROR' && lea.received[1].code, 'BAD_MESSAGE')
    assert.equal(lea.socket.readyState, WebSocket.OPEN)
})

test('le dernier onglet remplace le premier sans déconnecter le joueur', async t => {
    const { url, log, connections } = await start(t)
    const first = await open(url)
    first.send({ type: 'AUTH', token: 'lea' })
    await waitFor(() => first.received.length === 1)

    const second = await open(url)
    second.send({ type: 'AUTH', token: 'lea' })
    await once(first.socket, 'close')
    await waitFor(() => second.received.length === 1)

    assert.deepEqual(first.received[1], { type: 'REPLACED' })
    assert.equal(connections.isConnected(1), true)
    assert.deepEqual(log, ['connect 1', 'connect 1'])
})
