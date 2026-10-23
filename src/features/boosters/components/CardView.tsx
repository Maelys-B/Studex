import type { Card } from '../types'
import { RARITY_COLORS } from './rarityColors'
import '../assets/CardView.css'

export function CardView({ card }: {card: Card}) {
    return (
        <div
            className="card"
            style={{ background: card.color, borderColor: RARITY_COLORS[card.rarity] }}
        >
            <h2 className="card__title">{card.name}</h2>
            <p className="card__subtitle">{card.subtitle}</p>
            <img className="card__image" src={card.image} alt={card.name} />
        </div>
    )
}