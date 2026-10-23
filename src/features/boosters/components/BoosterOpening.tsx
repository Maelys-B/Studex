import { useBooster } from '../hooks/useBooster'
import type { Card, Rarity } from '../types'

const RARITY_COLORS: Record<Rarity, string> = {
    commun: 'gray',
    uncommun: 'green',
    rare: 'blue',
    epic: 'purple',
    legendary: 'orange'
}

function CardItem({ card }: { card: Card }) {
    return (
        <li style={{ color: RARITY_COLORS[card.rarity] }}>
            {card.name} - {card.rarity} ({card.type})
        </li>
    )
}

export function BoosterOpening() {
    const { content, open } = useBooster()

    return (
        <div>
            <button onClick={open}>Ouvrir un booster</button>
            {content && (
                <ul>
                    {content.collection.map((card, i) => (
                        <CardItem key={i} card={card} />
                    ))}
                    <CardItem card={content.battle} />
                    <CardItem card={content.student} />
                </ul>
            )}
        </div>
    )
}
