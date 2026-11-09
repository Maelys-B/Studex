import { useEffect, useState } from 'react'
import { CardView } from '../../boosters/components/CardView'
import { fetchPendingCards, reviewCard } from '../service/adminApi'
import type { PendingCard } from '../service/adminApi'
import { PageTitle } from '../../ui/components/PageTitle'
import fond from '../../boosters/assets/fond-booster.webp'
import '../assets/AdminPage.css'

export function AdminPage() {
    const [cards, setCards] = useState<PendingCard[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchPendingCards()
            .then(setCards)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const review = async (id:number, status: 'approved' | 'rejected') => {
        setError(null)
        try {
            await reviewCard(id, status)
            setCards(list => list.filter(c => c.id !== id)) 
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur serveur')
        }
    }

    if (loading) return <p className="page-loading">Chargement ...</p>

    return (
        <section className="page-shell moderation">
            <img className="page-bg" src={fond} alt="" draggable={false} />
            <div className="page-shell__head">
                <PageTitle>Modération</PageTitle>
                <p className="page-pill">
                    {cards.length} {cards.length > 1 ? 'cartes' : 'carte'} en attente
                </p>
            </div>
            {error && <p className="page-error">{error}</p>}

            {cards.length === 0 && (
                <div className="holo-panel moderation__empty">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                    <p>Aucune carte à valider.</p>
                </div>
            )}

            <div className="moderation__grid">
                {cards.map(card => (
                    <article className="holo-panel moderation__item" key={card.id}>
                        <h2 className="holo-panel__legend">
                            <svg className="holo-panel__icon" viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 21c1-5 15-5 16 0" />
                            </svg>
                            <span>Créée par {card.author}</span>
                        </h2>
                        <CardView
                            card={{
                                id: card.id,
                                name: card.name,
                                position_collection: 0,
                                subtitle: card.subtitle,
                                color: card.color,
                                avatar: card.avatar,
                                rarity: 'commun',
                                type: 'student'
                            }}
                        />
                        <div className="moderation__actions">
                            <button className="holo-btn holo-btn--accept" onClick={() => review(card.id, 'approved')}>
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                                Approuver
                            </button>
                            <button className="holo-btn holo-btn--danger" onClick={() => review(card.id, 'rejected')}>
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                                Refuser
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}
