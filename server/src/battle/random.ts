import type { PlayerIndex } from './type.js'

export function createRandom(seed: number): () => number {
    let s = seed | 0
    return () => {
        s = (s + 0x6D2B79F5) | 0
        let t = Math.imul(s ^ (s >>> 15), s | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export function drawFirstPlayer(seed: number): PlayerIndex {
    return createRandom(seed)() < 0.5 ? 0 : 1
}