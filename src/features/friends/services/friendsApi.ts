export type Relation = 'none' | 'sent' | 'received' | 'friends'

export type SearchResult = { id: number, username: string, relation: Relation }
export type Friend = { id: number, username: string }
export type FriendRequest = { id: number, userId: number, username: string }

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
})

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, { ...init, headers: authHeaders()})
    if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Erreur serveur')
    }
    return res.status === 204 ? (undefined as T) : res.json()
}

export const searchUsers = (q: string) =>
    request<SearchResult[]>(`/api/friends/search?q=${encodeURIComponent(q)}`)

export const fetchFriends = () => request<Friend[]>('/api/friends')

export const fetchRequests = () => request<FriendRequest[]>('/api/friends/requests')

export const sendRequest = (userId: number) =>
    request<{ relation: Relation }>('/api/friends/requests', {
        method: 'POST',
        body: JSON.stringify({ userId })
    })

export const answerRequest = (id: number, status: 'accepted' | 'rejected' ) =>
    request<{ status: string }>(`/api/friends/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    })

export const removeFriend = ( userId: number ) =>
    request<void>(`/api/friends/${userId}`, {method: 'DELETE' })
