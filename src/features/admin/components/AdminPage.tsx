import { useEffect, useState } from 'react'
import { CardView } from '../../boosters/components/CardView'
import { fetchPendingCards, reviewCard } from '../service/adminApi'
import type { PendingCard } from '../service/adminApi'

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

    if (loading) return <p>Chargement ...</p>

    return (
        <section>
            <h1>Cartes en attente</h1>
            {error && <p>{error}</p>}
            {cards.length === 0 && <p>Aucune carte à valider.</p>}

            {cards.map(card => (
                <article key={card.id}>
                    <p>Crée par {card.author}</p>
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
                    <button onClick={() => review(card.id, 'approved')}>Approuver</button>
                    <button onClick={() => review(card.id, 'rejected')}>Refuser</button>
                </article>
            ))}
        </section>
    )
}