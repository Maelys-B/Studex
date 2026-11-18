import type { OwnedCard } from '../types'

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export async function fetchCollection(): Promise<OwnedCard[]> {
    const response = await fetch('/api/collection', { headers: authHeaders() })
    if (!response.ok) {
        throw new Error('Impossible de récupérer la collection')
    }
    return response.json()
}

export async function deleteCards(cardIds: number[], all: boolean): Promise<void> {
    const response = await fetch('/api/collection', {
        method: 'DELETE',
        headers: {...authHeaders(), 'Content-Type': 'application/json',},
        body: JSON.stringify({ cardIds, all }),
    })

    if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error)
    }
}
