import { HttpError } from '../errors/HttpError.js'
import { prisma } from '../lib/prisma.js'
import { boosterRepository } from '../repositories/booster.repository.js'
import { cardRepository } from '../repositories/card.repository.js'
import type { BoosterState, BoosterStatus } from '../types.js'
import { BOOSTER_INTERVAL_MS, MAX_BOOSTERS, consumeBooster, openBooster, refillBoosters } from './boosterLogic.js'
import { toCard } from './card.service.js'

function describe(state: BoosterState, now: number): BoosterStatus {
    return {
        stored: state.stored,
        max: MAX_BOOSTERS,
        serverNow: now,
        nextAt: state.stored >= MAX_BOOSTERS ? null : state.lastGainedAt + BOOSTER_INTERVAL_MS,
    }
}

export const boosterService = {
    async getStatus(userId: number) {
        const now = Date.now()
        await boosterRepository.ensureState(userId, { stored: MAX_BOOSTERS, lastGainedAt: now })

        const state = await prisma.$transaction(async tx => {
            const refilled = refillBoosters(await boosterRepository.lockState(tx, userId), now)
            await boosterRepository.saveState(tx, userId, refilled)
            return refilled
        })

        return describe(state, now)
    },

    async open(userId: number) {
        const now = Date.now()
        await boosterRepository.ensureState(userId, { stored: MAX_BOOSTERS, lastGainedAt: now })

        const result = await prisma.$transaction(async tx => {
            const next = consumeBooster(await boosterRepository.lockState(tx, userId), now)
            if (!next) return null

            const pool = (await cardRepository.findApprovedWithAttacks(tx)).map(toCard)
            const content = openBooster(pool)

            await boosterRepository.saveState(tx, userId, next)
            await boosterRepository.addCards(tx, userId, [...content.collection, content.battle, content.student].map(card => card.id))
            return { state: next, content }
        })

        if (!result) throw new HttpError(409, 'no_booster')

        return { ...describe(result.state, now), content: result.content }
    },
}
