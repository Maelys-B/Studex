import type { Avatar, CardStatus } from '../../boosters/types'

export type StudentCardForm = {
    first_name: string,
    last_name: string,
    subtitle: string,
    color: string,
    avatar: Avatar
}

export type MyCard = {
    id: number,
    name: string,
    subtitle: string,
    color: string,
    avatar: Avatar,
    status: CardStatus
}

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
})

export async function fetchMyCard(): Promise<MyCard | null> {
    const res = await fetch('/api/cards/mine', { headers: authHeaders() })
    if (res.status === 404) return null
    if (!res.ok) throw new Error('Impossible de charger ta carte')
    return res.json()
}

export async function saveMyCard(form: StudentCardForm, exists: boolean): Promise<void> {
    const res = await fetch('/api/cards/mine', {
        method: exists ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form)
    })
    if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.erreur ?? 'Erreur serveur')
    }
}