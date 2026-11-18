export type ReportTarget =
    | { kind: 'card', id: number, name: string }
    | { kind: 'user', id: number, name: string }

export type ReportReason = 'inappropriate' | 'offensive' | 'harassment' | 'impersonation' | 'spam' | 'other'

export const MESSAGE_MAX_LENGTH = 500

export const CARD_REASONS: ReportReason[] = ['inappropriate', 'offensive', 'impersonation', 'other']
export const USER_REASONS: ReportReason[] = ['inappropriate', 'offensive', 'harassment', 'impersonation', 'spam', 'other']

export const REASON_LABELS: Record<ReportReason, string> = {
    inappropriate: 'Contenu inapproprié',
    offensive: 'Contenu offensant',
    harassment: 'Harcèlement',
    impersonation: "Usurpation d'identité",
    spam: 'Spam',
    other: 'Autre',
}

export async function sendReport(target: ReportTarget, reason: ReportReason, message: string): Promise<void> {
    const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
            ...(target.kind === 'card' ? { cardId: target.id } : { userId: target.id }),
            reason,
            message: message.trim() || undefined,
        }),
    })

    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? 'Erreur serveur')
    }
}
