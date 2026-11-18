import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { CARD_REASONS, MESSAGE_MAX_LENGTH, REASON_LABELS, USER_REASONS, sendReport } from '../services/reportsApi'
import type { ReportReason, ReportTarget } from '../services/reportsApi'
import '../assets/ReportModal.css'

type Props = {
    target: ReportTarget,
    onClose: () => void
}

export function ReportModal({ target, onClose }: Props) {
    const [reason, setReason] = useState<ReportReason | null>(null)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)

    const reasons = target.kind === 'card' ? CARD_REASONS : USER_REASONS
    const title = target.kind === 'card' ? `Signaler la carte « ${target.name} »` : `Signaler ${target.name}`

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') {
                return
            }
            e.stopPropagation()
            onClose()
        }
        window.addEventListener('keydown', onKeyDown, true)
        return () => window.removeEventListener('keydown', onKeyDown, true)
    }, [onClose])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!reason) {
            return
        }
        setSending(true)
        setError('')
        try {
            await sendReport(target, reason, message)
            setSent(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur serveur')
        } finally {
            setSending(false)
        }
    }

    return (
        <div
            className="report-modal"
            onClick={(e) => {
                e.stopPropagation()
                onClose()
            }}
        >
            <div
                className="report-modal__box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="report-modal-title" className="report-modal__title">{title}</h2>

                {sent ? (
                    <>
                        <p>Merci, ton signalement a bien été envoyé. Un administrateur va l'examiner.</p>
                        <div className="report-modal__actions">
                            <button type="button" onClick={onClose} autoFocus>Fermer</button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <fieldset className="report-modal__reasons">
                            <legend>Motif</legend>
                            {reasons.map(r => (
                                <label key={r} className="report-modal__reason">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r}
                                        checked={reason === r}
                                        onChange={() => setReason(r)}
                                    />
                                    {REASON_LABELS[r]}
                                </label>
                            ))}
                        </fieldset>

                        <label htmlFor="report-message">
                            Message (facultatif)
                        </label>
                        <textarea
                            id="report-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={MESSAGE_MAX_LENGTH}
                            rows={4}
                            placeholder="Précise ce qui pose problème"
                        />
                        <p className="report-modal__counter">{message.length} / {MESSAGE_MAX_LENGTH}</p>

                        {error && <p className="report-modal__error">{error}</p>}

                        <div className="report-modal__actions">
                            <button type="button" className="report-modal__cancel" onClick={onClose}>Annuler</button>
                            <button type="submit" className="report-modal__submit" disabled={!reason || sending}>
                                {sending ? 'Envoi...' : 'Signaler'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
