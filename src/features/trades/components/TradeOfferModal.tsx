import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { createPortal } from 'react-dom'
import { fetchCollection } from '../../collection/services/collectionService'
import { CardByType } from '../../boosters/components/CardByType'
import type { CardKind, Rarity } from '../../boosters/types'
import { counterTrade, createTrade, fetchPartnerCollection } from '../services/tradesApi'
import type { Offer, OfferSide, TradableCard, Trade, TradeSide } from '../types'
import '../../collection/assets/CollectionPage.css'
import '../assets/TradeOfferModal.css'

const MAX_CARDS_PER_SIDE = 10
const MAX_QUANTITY = 99
const MAX_COINS = 1_000_000

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

const RARITY_LABEL: Record<Rarity, string> = {
    common: 'Commune',
    uncommon: 'Peu commune',
    rare: 'Rare',
    epic: 'Épique',
    legendary: 'Légendaire',
}

type Selection = Record<number, number>

type Props = {
    partner: { id: number, username: string },
    trade?: Trade,
    onClose: () => void,
    onSent: () => void
}

const toSelection = (side?: TradeSide): Selection =>
    Object.fromEntries((side?.cards ?? []).map(card => [card.id, card.quantity]))

const toOfferSide = (coins: number, selection: Selection): OfferSide => ({
    coins,
    cards: Object.entries(selection).map(([cardId, quantity]) => ({ cardId: Number(cardId), quantity })),
})

type SetQuantity = (card: TradableCard, quantity: number) => void

const OfferCardTile = memo(function OfferCardTile({ card, quantity, canAdd, onSet }: {
    card: TradableCard,
    quantity: number,
    canAdd: boolean,
    onSet: SetQuantity
}) {
    return (
        <li className={`offer-card${quantity > 0 ? ' offer-card--selected' : ''}`}>
            <button
                type="button"
                className="offer-card__visual"
                onClick={() => onSet(card, quantity > 0 ? 0 : 1)}
                disabled={quantity === 0 && !canAdd}
                aria-pressed={quantity > 0}
                aria-label={quantity > 0 ? `Retirer ${card.name}` : `Choisir ${card.name}`}
            >
                <CardByType card={card} />
            </button>
            <span className="offer-card__owned">×{card.quantity}</span>

            <div className="offer-card__stepper">
                <button type="button" onClick={() => onSet(card, quantity - 1)} disabled={quantity === 0} aria-label={`Un ${card.name} de moins`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg>
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => onSet(card, quantity + 1)} disabled={!canAdd} aria-label={`Un ${card.name} de plus`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" /></svg>
                </button>
            </div>
        </li>
    )
})

const CardPicker = memo(function CardPicker({ title, cards, selection, pinned, onChange }: {
    title: string,
    cards: TradableCard[],
    selection: Selection,
    pinned: Selection,
    onChange: Dispatch<SetStateAction<Selection>>
}) {
    const [typeFilter, setTypeFilter] = useState<'all' | CardKind>('all')
    const [rarityFilter, setRarityFilter] = useState<'all' | Rarity>('all')
    const selectedCount = Object.keys(selection).length
    const isFull = selectedCount >= MAX_CARDS_PER_SIDE

    const visible = useMemo(() => cards
        .filter(card => typeFilter === 'all' || card.type === typeFilter)
        .filter(card => rarityFilter === 'all' || card.rarity === rarityFilter)
        .sort((a, b) =>
            Number(b.id in pinned) - Number(a.id in pinned)
            || RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity)),
    [cards, typeFilter, rarityFilter, pinned])

    const setQuantity = useCallback<SetQuantity>((card, quantity) => {
        onChange(previous => {
            const next = { ...previous }
            if (quantity <= 0) delete next[card.id]
            else next[card.id] = Math.min(quantity, card.quantity, MAX_QUANTITY)
            return next
        })
    }, [onChange])

    return (
        <div className="offer-picker">
            <div className="offer-picker__head">
                <span>{title}</span>
                <span className="offer-picker__count">{selectedCount} / {MAX_CARDS_PER_SIDE} cartes</span>
            </div>

            <div className="collection-page__filters offer-picker__filters">
                <label>
                    Type
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as 'all' | CardKind)}>
                        <option value="all">Tous</option>
                        <option value="collection">Collection</option>
                        <option value="battle">Combat</option>
                        <option value="student">Étudiant</option>
                    </select>
                </label>
                <label>
                    Rareté
                    <select value={rarityFilter} onChange={e => setRarityFilter(e.target.value as 'all' | Rarity)}>
                        <option value="all">Toutes</option>
                        {RARITY_ORDER.map(rarity => <option key={rarity} value={rarity}>{RARITY_LABEL[rarity]}</option>)}
                    </select>
                </label>
            </div>

            {visible.length === 0 ? (
                <p className="offer-picker__empty">Aucune carte.</p>
            ) : (
                <ul className="offer-picker__grid">
                    {visible.map(card => {
                        const quantity = selection[card.id] ?? 0
                        const canAdd = quantity < card.quantity && quantity < MAX_QUANTITY && (quantity > 0 || !isFull)
                        return <OfferCardTile key={card.id} card={card} quantity={quantity} canAdd={canAdd} onSet={setQuantity} />
                    })}
                </ul>
            )}
        </div>
    )
})

function CoinsInput({ label, value, onChange }: { label: string, value: number, onChange: (value: number) => void }) {
    return (
        <label className="offer-coins">
            <span>{label}</span>
            <input
                type="number"
                min={0}
                max={MAX_COINS}
                value={value}
                onChange={e => onChange(Math.min(Math.max(Math.floor(Number(e.target.value) || 0), 0), MAX_COINS))}
            />
        </label>
    )
}

export function TradeOfferModal({ partner, trade, onClose, onSent }: Props) {
    const [myCards, setMyCards] = useState<TradableCard[] | null>(null)
    const [theirCards, setTheirCards] = useState<TradableCard[] | null>(null)
    const [initialGive] = useState<Selection>(() => toSelection(trade?.give))
    const [initialReceive] = useState<Selection>(() => toSelection(trade?.receive))
    const [give, setGive] = useState<Selection>(initialGive)
    const [receive, setReceive] = useState<Selection>(initialReceive)
    const [giveCoins, setGiveCoins] = useState(trade?.give.coins ?? 0)
    const [receiveCoins, setReceiveCoins] = useState(trade?.receive.coins ?? 0)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([fetchCollection(), fetchPartnerCollection(partner.id)])
            .then(([mine, theirs]) => {
                setMyCards(mine)
                setTheirCards(theirs)
            })
            .catch(err => setError(err instanceof Error ? err.message : 'Erreur serveur'))
    }, [partner.id])

    useEffect(() => {
        document.body.classList.add('offer-modal-open')
        return () => document.body.classList.remove('offer-modal-open')
    }, [])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return
            e.stopPropagation()
            onClose()
        }
        window.addEventListener('keydown', onKeyDown, true)
        return () => window.removeEventListener('keydown', onKeyDown, true)
    }, [onClose])

    const offer: Offer = {
        give: toOfferSide(giveCoins, give),
        receive: toOfferSide(receiveCoins, receive),
    }
    const isEmpty = offer.give.coins === 0 && offer.give.cards.length === 0
        && offer.receive.coins === 0 && offer.receive.cards.length === 0

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (isEmpty) return
        setSending(true)
        setError('')
        try {
            if (trade) await counterTrade(trade.id, offer)
            else await createTrade(partner.id, offer)
            onSent()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur serveur')
        } finally {
            setSending(false)
        }
    }

    const title = trade ? `Contre-proposition à ${partner.username}` : `Proposer un échange à ${partner.username}`

    return createPortal(
        <div className="offer-modal" onClick={e => { e.stopPropagation(); onClose() }}>
            <div
                className="offer-modal__box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="offer-modal-title"
                onClick={e => e.stopPropagation()}
            >
                <h2 id="offer-modal-title" className="offer-modal__title">{title}</h2>

                <form onSubmit={handleSubmit}>
                    {!myCards || !theirCards ? (
                        !error && <p className="offer-picker__empty">Chargement ...</p>
                    ) : (
                        <div className="offer-modal__sides">
                            <div className="offer-modal__side">
                                <CardPicker title="Tu donnes" cards={myCards} selection={give} pinned={initialGive} onChange={setGive} />
                                <CoinsInput label="Coins que tu donnes" value={giveCoins} onChange={setGiveCoins} />
                            </div>
                            <div className="offer-modal__side">
                                <CardPicker title={`Tu reçois de ${partner.username}`} cards={theirCards} selection={receive} pinned={initialReceive} onChange={setReceive} />
                                <CoinsInput label="Coins que tu reçois" value={receiveCoins} onChange={setReceiveCoins} />
                            </div>
                        </div>
                    )}

                    {error && <p className="offer-modal__error">{error}</p>}

                    <div className="offer-modal__actions">
                        <button type="button" className="holo-btn holo-btn--ghost" onClick={onClose}>Annuler</button>
                        <button type="submit" className="holo-btn holo-btn--accept" disabled={isEmpty || sending || !myCards}>
                            {sending ? 'Envoi...' : trade ? 'Contre-proposer' : 'Proposer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )
}
