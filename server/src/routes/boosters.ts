import { Router } from 'express'
import {
    BOOSTER_INTERVAL_MS,
    MAX_BOOSTERS,
    consumeBooster,
    openBooster,
    refillBoosters
} from '../services/boosterLogic.js'
import { getState, loadPool, saveState, withTransaction } from '../services/boosterStore.js'
import type { BoosterState } from '../types.js'
import verifierToken from '../middleware/verifierToken.js'

export const boostersRouter = Router()
boostersRouter.use(verifierToken)

function describe(state: BoosterState, now: number) {
    return {
        stored: state.stored,
        max: MAX_BOOSTERS,
        serverNow: now,
        nextAt: state.stored >= MAX_BOOSTERS ? null : state.lastGainedAt + BOOSTER_INTERVAL_MS
    }
}

boostersRouter.get('/', async (_req, res) => {
    const userId = res.locals.userId as number

    const now = Date.now()
    const state = await withTransaction(async conn => {
        const refilled = refillBoosters(await getState(conn, userId), now)
        await saveState(conn, userId, refilled)
        return refilled
    })

    res.json(describe(state, now))
})

boostersRouter.post('/open', async (_req, res) => {
    const userId = res.locals.userId as number

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
