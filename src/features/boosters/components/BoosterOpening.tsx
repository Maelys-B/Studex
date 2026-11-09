import { useBooster } from '../hooks/useBooster'
import { RARITY_COLORS } from './rarityColors'
import { CardView } from './CardView'
import { CollectionCardView } from './CollectionCardView'
import { BattleCardView } from './BattleCardView'
import { BoosterPack } from './BoosterPack'
import fond from '../assets/fond-booster.webp'
import { useState } from 'react'
import type { AnimationEvent } from 'react'
import type { Card } from '../types'

type Direction = 'next' | 'previous'

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

export function BoosterOpening() {
    const {
        currentCard, isLast, index, cards, stored, max, msBeforeNext, error, open, next, previous, close
    } = useBooster()

    const [opening, setOpening] = useState(false)
    const [leaving, setLeaving] = useState<Direction | null>(null)
    const [entering, setEntering] = useState<Direction>('next')

    const handleAnimationEnd = async () => {
        await open()
        setOpening(false)
    }

    const changeCard = (direction: Direction) => {
        if (!leaving) setLeaving(direction)
    }

    const handleCardAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget || !leaving) return
        if (leaving === 'next') next()
        else previous()
        setEntering(leaving)
        setLeaving(null)
    }

    const handleClose = () => {
        setEntering('next')
        close()
    }

    return (
        <section className="booster-page">
            <img className="booster-page__bg" src={fond} alt="" draggable={false} />
            {currentCard ? (
                <div className="booster-page__reveal">
                    <button
                        className="booster-page__arrow booster-page__arrow--previous"
                        onClick={() => changeCard('previous')}
                        disabled={index === 0}
                        aria-label="Carte précédente"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                    </button>
                    <div
                        key={index}
                        className={`booster-page__card booster-page__card--${leaving ? `out-${leaving}` : `in-${entering}`}`}
                        onAnimationEnd={handleCardAnimationEnd}
                    >
                        {currentCard.type === 'collection'
                            ? <CollectionCardView card={currentCard} />
                            : currentCard.type === 'battle'
                                ? <BattleCardView card={currentCard} />
                                : currentCard.image || currentCard.avatar
                                    ? <CardView card={currentCard} />
                                    : <ul><CardItem card={currentCard} /></ul>}
                    </div>
                    <button
                        className="booster-page__arrow booster-page__arrow--next"
                        onClick={() => changeCard('next')}
                        disabled={isLast}
                        aria-label="Carte suivante"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </button>
                    <div className="booster-page__foot">
                        <span className="booster-page__stock">{index + 1} / {cards.length}</span>
                        {isLast && (
                            <button className="booster-page__open" onClick={handleClose}>
                                Continuer
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="booster-page__stage">
                    <BoosterPack
                        onClick={() => setOpening(true)}
                        disabled={stored === 0}
                        opening={opening}
                        onAnimationEnd={handleAnimationEnd}
                    />
                    <div className="booster-page__controls">
                        <button
                            className="booster-page__open"
                            onClick={() => setOpening(true)}
                            disabled={stored === 0}
                        >
                            <svg className="booster-page__open-icon" viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="9" y="5" width="11" height="15" rx="2" transform="rotate(10 14 12)" />
                                <rect x="4" y="4" width="11" height="15" rx="2" transform="rotate(-8 10 12)" />
                            </svg>
                            Ouvrir un booster
                        </button>
                        <p className="booster-page__stock">
                            {stored} / {max}
                            {stored < max && <span className="booster-page__timer">Prochain dans {formatTime(msBeforeNext)}</span>}
                        </p>
                    </div>
                </div>
            )}
            {error && <p className="booster-page__error">{error}</p>}
        </section>
    )
}
