import type { Offer, TradableCard, Trade } from '../types'

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
})

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, { ...init, headers: authHeaders() })
    if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Erreur serveur')
    }
    return res.status === 204 ? (undefined as T) : res.json()
}

export const fetchTrades = () => request<Trade[]>('/api/trades')

export const fetchTrade = (id: number) => request<Trade>(`/api/trades/${id}`)

export const fetchPartnerCollection = (userId: number) =>
    request<TradableCard[]>(`/api/trades/partners/${userId}/collection`)

export const createTrade =(partnerId: number, offer: Offer) =>
    request<Trade>('/api/trades', {
        method: 'POST',
        body: JSON.stringify({ partnerId, ...offer })
    })

export const counterTrade = (id: number, offer: Offer) =>
    request<Trade>(`/api/trades/${id}/counter`, {
        method: 'POST',
        body: JSON.stringify(offer)
    })

export const acceptTrade = (id: number) =>
    request<Trade>(`/api/trades/${id}/accept`, { method: 'POST' })

export const declineTrade = (id: number) =>
    request<void>(`/api/trades/${id}/decline`, { method: 'POST' })

export const cancelTrade = (id: number) =>
    request<void>(`/api/trades/${id}/cancel`, { method: 'POST' })
