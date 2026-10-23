import type { BoosterContent } from '../types'
import { CARD_POOL } from '../data/cards_test'
import { useState } from 'react'
import { openBooster } from '../services/boosterLogic'

export function useBooster() {
    const [content, setContent] = useState<BoosterContent | null>(null)
    const [index, setIndex] = useState(0)

    const cards = content ? [...content.collection, content.battle, content.student] : []

    const open = () => {
        setContent(openBooster(CARD_POOL))
        setIndex(0)
    }

    const next = () => setIndex(i => Math.min(i + 1, cards.length - 1))

    const previous = () => setIndex(i => Math.max(i - 1, 0))

    return { 
        currentCard: cards[index],
        isLast: index === cards.length - 1,
        index,
        cards,
        open,
        next,
        previous
    }
}