import type { BoosterContent, BoosterStatus } from '../types'

export type OpenBoosterResponse = BoosterStatus & { content: BoosterContent }

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })


export async function fetchBoosterStatus(): Promise<BoosterStatus> {
    const response = await fetch('/api/boosters', { headers: authHeaders() })
    if (!response.ok) {
        throw new Error('Impossible de récupérer les boosters')
    }
    return response.json()
}

export async function requestOpenBooster(): Promise<OpenBoosterResponse | null> {
    const response = await fetch('/api/boosters/open', {
        method: 'POST',
        headers: authHeaders()
    })
    if (response.status === 409) {
        return null
    }
    if (!response.ok) {
        throw new Error("Impossible d'ouvrir le booster")
    }
    return response.json()
}
