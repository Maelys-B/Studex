import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Card, Rarity } from '../../boosters/types'
import { CollectionCardView } from '../../boosters/components/CollectionCardView'
import { BattleCardView } from '../../boosters/components/BattleCardView'
import boosterImage from '../../boosters/assets/booster/booster.webp'
import '../../ui/assets/ui.css'
import '../assets/AuthPage.css'

const CHANGE_DELAY_MS = 10000

const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

function pickOnePerRarity(list: Card[]) {
    return RARITIES.flatMap(rarity => {
        const pool = list.filter(card => card.rarity === rarity)
        return pool.length ? [pool[Math.floor(Math.random() * pool.length)]] : []
    })
}

export function AuthLayout({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<Card[]>([])
    const [index, setIndex] = useState(0)

    useEffect(() => {
        fetch('/api/cards/showcase')
            .then(res => (res.ok ? res.json() : []))
            .then((list: Card[]) => setCards(pickOnePerRarity(list)))
            .catch(() => setCards([]))
    }, [])

    useEffect(() => {
        if (cards.length < 2) return
        const timer = setInterval(() => setIndex(i => (i + 1) % cards.length), CHANGE_DELAY_MS)
        return () => clearInterval(timer)
    }, [cards.length])

    const card = cards[index]

    return (
        <main className="auth-page">
            <div className="auth-page__brand">
                <h1 className="auth-page__title">Studex</h1>
                <div className="auth-page__showcase" aria-hidden="true">
                    {card ? (
                        <div className="auth-page__card" key={`${card.id}-${index}`}>
                            {card.type === 'battle' ? <BattleCardView card={card} /> : <CollectionCardView card={card} />}
                        </div>
                    ) : (
                        <img className="auth-page__booster" src={boosterImage} alt="" draggable={false} />
                    )}
                </div>
            </div>
            {children}
        </main>
    )
}
