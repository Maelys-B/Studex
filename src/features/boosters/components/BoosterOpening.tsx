import { useBooster } from '../hooks/useBooster'
import { RARITY_COLORS } from './rarityColors'
import { CardView } from './CardView'
import type { Card } from '../types'

function CardItem({ card }: { card: Card }) {
    return (
        <li style={{ color: RARITY_COLORS[card.rarity] }}>
            {card.name} - {card.rarity} ({card.type})
        </li>
    )
}

export function BoosterOpening() {
    const { currentCard, isLast, index, cards, open, next, previous } = useBooster()

    return (
        <div>
            <button onClick={open}>Ouvrir un booster</button>
            {currentCard && (
                <div>
                    {currentCard.image
                        ? <CardView card={currentCard} />
                        : <ul><CardItem card={currentCard} /></ul>}
                    <p>{index + 1} / {cards.length}</p>
                    <button onClick={previous} disabled={index === 0}>←</button>
                    <button onClick={next} disabled={isLast}>→</button>
                </div>
            )}
        </div>
    )
}
