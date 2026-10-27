import { useBooster } from '../hooks/useBooster'
import { RARITY_COLORS } from './rarityColors'
import { CardView } from './CardView'
import { CollectionCardView } from './CollectionCardView'
import { BattleCardView } from './BattleCardView'
import type { Card } from '../types'

function CardItem({ card }: { card: Card }) {
    return (
        <li style={{ color: RARITY_COLORS[card.rarity] }}>
            {card.name} - {card.rarity} ({card.type})
        </li>
    )
}

function formatTime(ms: number): string {
    const totalSeconds = Math.ceil(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return [hours, minutes, seconds].map(n => String(n).padStart(2, '0')).join(':')
}

export function BoosterOpening({ userId }: { userId: number }) {
    const {
        currentCard, isLast, index, cards, stored, max, msBeforeNext, error, open, next, previous
    } = useBooster(userId)

    return (
        <div>
            <p>Boosters : {stored} / {max}</p>
            {stored < max && <p>Prochain dans {formatTime(msBeforeNext)}</p>}
            {error && <p>{error}</p>}
            <button onClick={open} disabled={stored === 0}>Ouvrir un booster</button>
            {currentCard && (
                <div>
                    {currentCard.type === 'collection'
                        ? <CollectionCardView card={currentCard} />
                        : currentCard.type === 'battle'
                            ? <BattleCardView card={currentCard} />
                            : currentCard.image
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
