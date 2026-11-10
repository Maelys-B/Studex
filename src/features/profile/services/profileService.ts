import type { User } from '../../auth/types'

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export type ProfilData = {
    pseudo: string,
    email: string,
}

export type MdpData = {
    ancienMdp: string,
    nouveauMdp: string,
}

export async function updateProfil(data: ProfilData): Promise<User> {
    const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    const json = await response.json()

    if (!response.ok) {
        throw new Error(json.erreur)
    }

    return json.user
}

export async function updateMdp(data: MdpData): Promise<void> {
    const response = await fetch('/api/profile/mdp', {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const json = await response.json()
        throw new Error(json.erreur)
    }
}
