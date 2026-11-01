import type { Card } from '../types'
import { RARITY_COLORS } from './rarityColors'
import { getCardImage } from '../assets/cardImages'
import { AvatarView } from '../../creation-card/components/AvatarView'
import '../assets/CardView.css'

export function CardView({ card }: {card: Card}) {
    return (
        <div
            className="card"
            style={{ background: card.color, borderColor: RARITY_COLORS[card.rarity] }}
        >
            <h2 className="card__title">{card.name}</h2>
            <p className="card__subtitle">{card.subtitle}</p>
            {card.avatar
                ? <div className="card__image card__avatar"><AvatarView avatar={card.avatar} /></div>
                : <img className="card__image" src={getCardImage(card.image)} alt={card.name} />}
        </div>
    )
}