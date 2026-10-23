import type { BoosterContent } from '../types'
import { CARD_POOL } from '../data/cards_test'
import { useState } from 'react'
import { openBooster } from '../services/boosterLogic'

export function useBooster() {
    const [content, setContent] = useState<BoosterContent | null>(null)

    const open = () => {
        setContent(openBooster(CARD_POOL))
    }

    return { content, open }
}