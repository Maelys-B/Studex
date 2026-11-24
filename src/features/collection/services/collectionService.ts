import type { OwnedCard } from '../types'

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export async function fetchCollection(): Promise<OwnedCard[]> {
    const response = await fetch('/api/collection', { headers: authHeaders() })
    if (!response.ok) {
        throw new Error('Impossible de récupérer la collection')
    }
    return response.json()
}

export async function sellCards(cardId: number, count: number): Promise<{ earned: number, coins: number }> {
    const response = await fetch('/api/collection/sell', {
        method: 'POST',
        headers: {...authHeaders(), 'Content-Type': 'application/json',},
        body: JSON.stringify({ cardId, count }),
    })

    const json = await response.json()
    if (!response.ok) {
        throw new Error(json.error)
    }
    return json
}
