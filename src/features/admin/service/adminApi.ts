import type { Avatar } from '../../boosters/types'

export type PendingCard = {
    id: number,
    name: string,
    subtitle: string,
    color: string,
    avatar: Avatar,
    author: string

}

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
})

export async function fetchPendingCards(): Promise<PendingCard[]> {
    const res = await fetch('/api/admin/cards/pending', { headers: authHeaders() })
    if (!res.ok) throw new Error('Impossible de charger les cartes en attente')
    return res.json()
}

export async function reviewCard(id: number, status: 'approved' | 'rejected'): Promise<void> {
    const res = await fetch(`/api/admin/cards/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status })
    })
    if (!res.ok) throw new Error('Action impossible')
}