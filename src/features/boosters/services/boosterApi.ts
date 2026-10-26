import type { BoosterContent, BoosterStatus } from '../types'

export type OpenBoosterResponse = BoosterStatus & { content: BoosterContent }

const headersOf = (userId: number) => ({ 'x-user-id': String(userId) })

export async function fetchBoosterStatus(userId: number): Promise<BoosterStatus> {
    const response = await fetch('/api/boosters', { headers: headersOf(userId) })
    if (!response.ok) {
        throw new Error('Impossible de récupérer les boosters')
    }
    return response.json()
}

// Retourne null quand le joueur n'a plus de booster
export async function requestOpenBooster(userId: number): Promise<OpenBoosterResponse | null> {
    const response = await fetch('/api/boosters/open', {
        method: 'POST',
        headers: headersOf(userId)
    })
    if (response.status === 409) {
        return null
    }
    if (!response.ok) {
        throw new Error("Impossible d'ouvrir le booster")
    }
    return response.json()
}
