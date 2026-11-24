import type { Avatar, CardStatus } from '../../boosters/types'
import type { Talent } from '@shared/talent'

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
    status: CardStatus,
    talent: Talent | null
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

export async function saveMyCard(form: StudentCardForm, exists: boolean, talent: Talent | null): Promise<void> {
    const res = await fetch('/api/cards/mine', {
        method: exists ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(exists ? form : { ...form, talent })
    })
    if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Erreur serveur')
    }
}

export async function saveMyTalent(talent: Talent): Promise<void> {
    const res = await fetch('/api/cards/mine/talent', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ talent })
    })
    if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Erreur serveur')
    }
}