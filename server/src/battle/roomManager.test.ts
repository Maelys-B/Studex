import assert from 'node:assert/strict'
import { test, type TestContext } from 'node:test'
import type { BattleSnapshot, ServerMessage } from '../shared/protocol.js'
import type { BattleCard, PlayerSetup } from '../shared/type.js'
import { chooseRandomAction } from './bots/randomBot.js'
import { DEFAULT_TIMINGS, type ChooseAction, type Participant } from './room.js'
import { RoomManager } from './roomManager.js'

function card(id: number): BattleCard {
    return {
        id, name: `Carte ${id}`, maxHp: 80, hp: 80,
        abilities: [
            { name: 'Coup', kind: 'attack', cost: 1, value: 30 },
            { name: 'Garde', kind: 'defense', cost: 1, value: 20 }
        ]
    }
}

function setup(userId: number): PlayerSetup {
    return { userId, cards: [1, 2, 3, 4, 5].map(card), active: 1, bench: [2, 3], reserve: [4, 5], talent: 'guardian' }
}

const human = (userId: number): Participant => ({ kind: 'human', name: `Joueur ${userId}`, setup: setup(userId) })
const bot = (chooseAction: ChooseAction): Participant => ({ kind: 'bot', name: 'Bot', setup: setup(-1), chooseAction })

function start() {
    const inbox = new Map<number, ServerMessage[]>()
    const manager = new RoomManager((userId, message) => {
        inbox.set(userId, [...(inbox.get(userId) ?? []), message])
    }, { ...DEFAULT_TIMINGS, botDelayMs: 0 })
    const messages = (userId: number) => inbox.get(userId) ?? []
    const last = (userId: number) => messages(userId)[messages(userId).length - 1]
    const battle = (userId: number): BattleSnapshot => {
        const found = messages(userId).filter(m => m.type === 'BATTLE_STATE' || m.type === 'BATTLE_UPDATE')
        return found[found.length - 1].battle
    }
    return { manager, messages, last, battle }
}

function startDuel(t: TestContext) {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
    const game = start()
    const battleId = game.manager.createRoom(human(1), human(2))
    const [active, waiting] = game.battle(1).view.yourTurn ? [1, 2] : [2, 1]
    return { ...game, battleId, active, waiting }
}

test('envoie sa propre vue à chaque joueur au début', t => {
    const { messages, battle } = startDuel(t)
    for (const userId of [1, 2]) {
        assert.equal(messages(userId)[0].type, 'BATTLE_STATE')
        assert.equal(battle(userId).view.me.userId, userId)
    }
})

test('une action avance le combat pour les deux joueurs', t => {
    const { manager, battleId, active, battle } = startDuel(t)
    manager.play(active, battleId, 0, { type: 'PASS' })
    assert.equal(battle(1).seq, 1)
    assert.equal(battle(2).seq, 1)
    assert.equal(battle(active).view.yourTurn, false)
})

test('refuse une action en double, interdite ou hors du combat', t => {
    const { manager, battleId, active, waiting, messages } = startDuel(t)
    const errors = (userId: number) => messages(userId).flatMap(m => (m.type === 'ERROR' ? [m.code] : []))

    manager.play(waiting, battleId, 0, { type: 'PASS' })
    assert.deepEqual(errors(waiting), ['ILLEGAL_ACTION'])

    manager.play(active, battleId, 0, { type: 'PASS' })
    manager.play(active, battleId, 0, { type: 'PASS' })
    assert.deepEqual(errors(active), ['STALE_ACTION'])

    manager.play(active, 'autre', 1, { type: 'PASS' })
    manager.play(3, battleId, 1, { type: 'PASS' })
    assert.deepEqual(errors(active), ['STALE_ACTION', 'UNKNOWN_BATTLE'])
    assert.deepEqual(errors(3), ['UNKNOWN_BATTLE'])
})

test('un abandon termine le combat et libère les joueurs', t => {
    const { manager, battleId, battle } = startDuel(t)
    manager.forfeit(1, battleId)
    assert.equal(battle(2).view.phase, 'ended')
    assert.equal(battle(2).view.result, 1)
    assert.equal(manager.isBusy(1), false)
    assert.equal(manager.isBusy(2), false)
})

test('un joueur ne peut pas être dans deux combats', t => {
    const { manager } = startDuel(t)
    assert.throws(() => manager.createRoom(human(3), human(1)))
    assert.throws(() => manager.createRoom(human(4), human(4)))
    assert.equal(manager.isBusy(3), false)
})

test('renvoie le combat à un joueur qui revient et prévient son adversaire', t => {
    const { manager, last } = startDuel(t)
    manager.disconnect(1)
    const left = last(2)
    assert.equal(left.type === 'OPPONENT_CONNECTION' && left.connected, false)
    manager.connect(1)
    assert.equal(last(1).type, 'BATTLE_STATE')
    const back = last(2)
    assert.equal(back.type === 'OPPONENT_CONNECTION' && back.connected, true)
})

async function playAgainst(opponent: Participant) {
    const { manager, battle } = start()
    const battleId = manager.createRoom(human(1), opponent)
    const limit = Date.now() + 5000
    while (battle(1).view.phase !== 'ended') {
        if (Date.now() > limit) assert.fail('Délai dépassé')
        const { seq, view } = battle(1)
        if (view.yourTurn) manager.play(1, battleId, seq, chooseRandomAction(view, Math.random))
        await new Promise(resolve => setTimeout(resolve, 1))
    }
    assert.equal(manager.isBusy(1), false)
}

test('un bot joue jusqu’à la fin du combat', () => playAgainst(bot(chooseRandomAction)))

test('un bot en erreur ne bloque pas le combat', async t => {
    t.mock.method(console, 'error', () => {})
    await playAgainst(bot(() => { throw new Error('bug') }))
    await playAgainst(bot(() => ({ type: 'SWITCH', from: 99, to: 98 })))
})

test('joue une action par défaut quand le tour est écoulé', t => {
    const { active, battle } = startDuel(t)
    t.mock.timers.tick(29999)
    assert.equal(battle(active).seq, 0)
    t.mock.timers.tick(1)
    assert.equal(battle(active).seq, 1)
    assert.equal(battle(active).view.yourTurn, false)
})

test('chaque action relance le chrono du tour', t => {
    const { manager, battleId, active, waiting, battle } = startDuel(t)
    t.mock.timers.tick(20000)
    manager.play(active, battleId, 0, { type: 'PASS' })
    assert.equal(battle(waiting).timeLeftMs, 30000)
    t.mock.timers.tick(20000)
    assert.equal(battle(waiting).seq, 1)
    t.mock.timers.tick(10000)
    assert.equal(battle(waiting).seq, 2)
})

test('une action refusée ne relance pas le chrono du tour', t => {
    const { manager, battleId, waiting, battle } = startDuel(t)
    t.mock.timers.tick(20000)
    manager.play(waiting, battleId, 0, { type: 'PASS' })
    assert.equal(battle(waiting).timeLeftMs, 10000)
})

test('un joueur absent 60 secondes abandonne', t => {
    const { manager, battle } = startDuel(t)
    manager.disconnect(1)
    t.mock.timers.tick(59999)
    assert.notEqual(battle(2).view.phase, 'ended')
    t.mock.timers.tick(1)
    assert.equal(battle(2).view.phase, 'ended')
    assert.equal(battle(2).view.result, 1)
    assert.equal(manager.isBusy(1), false)
})

test('un joueur revenu à temps n’abandonne pas', t => {
    const { manager, battle } = startDuel(t)
    manager.disconnect(1)
    t.mock.timers.tick(59000)
    manager.connect(1)
    t.mock.timers.tick(5000)
    assert.notEqual(battle(2).view.phase, 'ended')
})

test('plus rien ne se passe après la fin du combat', t => {
    const { manager, battleId, messages } = startDuel(t)
    manager.disconnect(1)
    manager.forfeit(2, battleId)
    const count = messages(2).length
    assert.equal(messages(2).filter(m => m.type === 'BATTLE_UPDATE')[0].battle.timeLeftMs, 0)
    t.mock.timers.tick(120000)
    assert.equal(messages(2).length, count)
})
