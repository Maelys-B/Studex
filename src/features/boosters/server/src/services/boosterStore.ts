import type { BoosterState } from '../../../types'
import { MAX_BOOSTERS } from '../../../services/boosterLogic'

const states = new Map<string, BoosterState>()

export function getState(userId: string): BoosterState {
    return states.get(userId) ?? { stored: MAX_BOOSTERS, lastGainedAt: Date.now()}
}

export function saveState(userId: string, state: BoosterState) {
    states.set(userId, state)
}