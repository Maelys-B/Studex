import { CardView } from './CardView'
import { CollectionCardView } from './CollectionCardView'
import { BattleCardView } from './BattleCardView'
import type { Card } from '../types'

export function CardByType({ card }: { card: Card }) {
    if (card.type === 'collection') {
        return <CollectionCardView card={card} />
    }
    if (card.type === 'battle') {
        return <BattleCardView card={card} />
    }
    return <CardView card={card} />
}
