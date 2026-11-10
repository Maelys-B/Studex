import type { User } from '../../auth/types'

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export type ProfileData = {
    username: string,
    email: string,
}

export type PasswordData = {
    oldPassword: string,
    newPassword: string,
}

export async function updateProfile(data: ProfileData): Promise<User> {
    const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    const json = await response.json()

    if (!response.ok) {
        throw new Error(json.error)
    }

    return json.user
}

export async function updatePassword(data: PasswordData): Promise<void> {
    const response = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error)
    }
}
