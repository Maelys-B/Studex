import { Router } from 'express'
import type { Request } from 'express'
import {
    BOOSTER_INTERVAL_MS,
    MAX_BOOSTERS,
    consumeBooster,
    openBooster,
    refillBoosters
} from '../services/boosterLogic.js'
import { getState, loadPool, saveState, withTransaction } from '../services/boosterStore.js'
import type { BoosterState } from '../types.js'

export const boostersRouter = Router()

function userIdOf(req: Request): number | null {
    const userId = Number(req.header('x-user-id'))
    return Number.isSafeInteger(userId) && userId > 0 ? userId : null
}

function describe(state: BoosterState, now: number) {
    return {
        stored: state.stored,
        max: MAX_BOOSTERS,
        serverNow: now,
        nextAt: state.stored >= MAX_BOOSTERS ? null : state.lastGainedAt + BOOSTER_INTERVAL_MS
    }
}

boostersRouter.get('/', async (req, res) => {
    const userId = userIdOf(req)
    if (userId === null) {
        res.status(401).json({ error: 'user_required' })
        return
    }

    const now = Date.now()
    const state = await withTransaction(async conn => {
        const refilled = refillBoosters(await getState(conn, userId), now)
        await saveState(conn, userId, refilled)
        return refilled
    })

    res.json(describe(state, now))
})

boostersRouter.post('/open', async (req, res) => {
    const userId = userIdOf(req)
    if (userId === null) {
        res.status(401).json({ error: 'user_required' })
        return
    }

    const now = Date.now()
    const result = await withTransaction(async conn => {
        const next = consumeBooster(await getState(conn, userId), now)
        if (!next) return null

        const content = openBooster(await loadPool(conn))
        await saveState(conn, userId, next)
        return { state: next, content }
    })

    if (!result) {
        res.status(409).json({ error: 'no_booster' })
        return
    }

    res.json({ ...describe(result.state, now), content: result.content })
})
