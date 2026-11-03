import { useEffect, useState } from 'react'
import { fetchCollection } from '../services/collectionService'
import { CardView } from '../../boosters/components/CardView'
import { CollectionCardView } from '../../boosters/components/CollectionCardView'
import { BattleCardView } from '../../boosters/components/BattleCardView'
import type { Card } from '../../boosters/types'
import type { OwnedCard } from '../types'

function CardByType({ card }: { card: Card }) {
    if (card.type === 'collection') return <CollectionCardView card={card} />
    if (card.type === 'battle') return <BattleCardView card={card} />
    return <CardView card={card} />
}

export function CollectionPage() {
    const [cards, setCards] = useState<OwnedCard[]>([])
    const [error, setError] = useState('')

    useEffect(() => {
        fetchCollection()
            .then(setCards)
            .catch(err => setError(err.message))
    }, [])

    if (error) {
        return <p className="collection-page__error">{error}</p>
    }

    if (cards.length === 0) {
        return <p className="collection-page__empty">Aucune carte pour l'instant, ouvre un booster !</p>
    }

    return (
        <section className="collection-page">
            <ul className="collection-page__grid">
                {cards.map(card => (
                    <li key={card.id} className="collection-page__item">
                        <CardByType card={card} />
                        {card.quantity > 1 && <span className="collection-page__quantity">×{card.quantity}</span>}
                    </li>
                ))}
            </ul>
        </section>
    )
}
