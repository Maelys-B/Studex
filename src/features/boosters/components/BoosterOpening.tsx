import { useBooster } from '../hooks/useBooster'
import { RARITY_COLORS } from './rarityColors'
import { CardView } from './CardView'
import { CollectionCardView } from './CollectionCardView'
import { BattleCardView } from './BattleCardView'
import { BoosterPack } from './BoosterPack'
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
        currentCard, isLast, index, cards, stored, max, msBeforeNext, error, open, next, previous, close
    } = useBooster(userId)

    return (
        <section className="booster-page">
            {currentCard ? (
                <div className="booster-page__reveal">
                    {currentCard.type === 'collection'
                        ? <CollectionCardView card={currentCard} />
                        : currentCard.type === 'battle'
                            ? <BattleCardView card={currentCard} />
                            : currentCard.image
                                ? <CardView card={currentCard} />
                                : <ul><CardItem card={currentCard} /></ul>}
                    <div className="booster-page__nav">
                        <button onClick={previous} disabled={index === 0}>←</button>
                        <span>{index + 1} / {cards.length}</span>
                        <button onClick={next} disabled={isLast}>→</button>
                    </div>
                    {isLast && (
                        <button className="booster-page__open" onClick={close}>
                            Continuer
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <BoosterPack disabled={stored === 0} />
                    <button className="booster-page__open" onClick={open} disabled={stored === 0}>
                        Ouvrir un booster
                    </button>
                </>
            )}
            {!currentCard && (
                <>
                    <p className="booster-page__stock">{stored} / {max}</p>
                    {stored < max && <p className="booster-page__timer">Prochain dans {formatTime(msBeforeNext)}</p>}
                </>
            )}
            {error && <p className="booster-page__error">{error}</p>}
        </section>
    )
}
