import { useEffect, useState } from 'react'
import { fetchCollection, sellCards } from '../services/collectionService'
import { CardByType } from '../../boosters/components/CardByType'
import { CardTilt } from '../../boosters/components/CardTilt'
import type { CardKind, Rarity } from '../../boosters/types'
import type { OwnedCard } from '../types'
import { ReportModal } from '../../reports/components/ReportModal'
import '../assets/CollectionPage.css'

type TypeFilter = 'all' | CardKind
type SortOrder = 'recent' | 'oldest' | 'rarity' | 'quantity'

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

function sortCards(cards: OwnedCard[], order: SortOrder): OwnedCard[] {
    return [...cards].sort((a, b) => {
        if (order === 'recent') {
            return b.obtained_at.localeCompare(a.obtained_at)
        }
        if (order === 'oldest') {
            return a.obtained_at.localeCompare(b.obtained_at)
        }
        if (order === 'quantity') {
            return b.quantity - a.quantity
        }
        return RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity)
    })
}

type CollectionPageProps = {
    onCoinsChange: (coins: number) => void
}

export function CollectionPage({ onCoinsChange }: CollectionPageProps) {
    const [cards, setCards] = useState<OwnedCard[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
    const [sortOrder, setSortOrder] = useState<SortOrder>('recent')
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [busy, setBusy] = useState(false)
    const [actionError, setActionError] = useState('')
    const [pendingSellAll, setPendingSellAll] = useState<boolean | null>(null)
    const [lastSale, setLastSale] = useState(0)
    const [reporting, setReporting] = useState(false)

    useEffect(() => {
        fetchCollection()
            .then(setCards)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const selectedCard = cards.find(card => card.id === selectedId) ?? null

    const closeModal = () => {
        setSelectedId(null)
        setActionError('')
        setPendingSellAll(null)
        setLastSale(0)
        setReporting(false)
    }

    useEffect(() => {
        if (selectedId === null) {
            return
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') {
                return
            }
            if (pendingSellAll !== null) {
                setPendingSellAll(null)
            } else {
                closeModal()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [selectedId, pendingSellAll])

    const handleSell = async (card: OwnedCard, all: boolean) => {
        const count = all ? card.quantity : 1
        setPendingSellAll(null)
        setBusy(true)
        setActionError('')
        setLastSale(0)
        try {
            const { earned, coins } = await sellCards(card.id, count)
            setCards(current => current
                .map(c => c.id === card.id ? { ...c, quantity: c.quantity - count } : c)
                .filter(c => c.quantity > 0)
            )
            setLastSale(earned)
            onCoinsChange(coins)
        } catch (err) {
            if (err instanceof Error) {
                setActionError(err.message)
            }
        } finally {
            setBusy(false)
        }
    }

    if (loading) {
        return <p className="collection-page__empty">Chargement...</p>
    }

    if (error) {
        return <p className="collection-page__error">{error}</p>
    }

    if (cards.length === 0) {
        return <p className="collection-page__empty">Aucune carte pour l'instant, ouvre un booster !</p>
    }

    const filteredCards = typeFilter === 'all' ? cards : cards.filter(card => card.type === typeFilter)
    const visibleCards = sortCards(filteredCards, sortOrder)

    return (
        <section className="collection-page">
            <div className="collection-page__filters">
                <label>
                    Type
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}>
                        <option value="all">Tous</option>
                        <option value="collection">Collection</option>
                        <option value="battle">Combat</option>
                        <option value="student">Étudiant</option>
                    </select>
                </label>

                <label>
                    Trier par
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}>
                        <option value="recent">Plus récentes</option>
                        <option value="oldest">Plus anciennes</option>
                        <option value="rarity">Rareté</option>
                        <option value="quantity">Quantité</option>
                    </select>
                </label>
            </div>

            {visibleCards.length === 0 ? (
                <p className="collection-page__empty">Aucune carte de ce type.</p>
            ) : (
                <ul className="collection-page__grid">
                    {visibleCards.map(card => (
                        <li key={card.id} className="collection-page__item">
                            <button
                                type="button"
                                className="collection-page__card-button"
                                onClick={() => setSelectedId(card.id)}
                                aria-label={`Voir ${card.name}`}
                            >
                                <CardByType card={card} />
                            </button>
                            {card.quantity > 1 && <span className="collection-page__quantity">×{card.quantity}</span>}
                        </li>
                    ))}
                </ul>
            )}

            {selectedCard && (
                <div className="collection-modal" onClick={closeModal}>
                    <div
                        className="collection-modal__content"
                        role="dialog"
                        aria-modal="true"
                        aria-label={selectedCard.name}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="collection-modal__card">
                            <CardTilt>
                                <CardByType card={selectedCard} />
                            </CardTilt>
                            <button type="button" className="collection-modal__close" onClick={closeModal} aria-label="Fermer">
                                
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                        </div>

                        <div className="collection-modal__side">
                            <p className="collection-modal__quantity">
                                {selectedCard.quantity} exemplaire{selectedCard.quantity > 1 ? 's' : ''}
                            </p>

                            <div className="collection-modal__actions">
                                <button type="button" className="collection-modal__sell" disabled={busy} onClick={() => setPendingSellAll(false)}>
                                    Vendre un exemplaire (+{selectedCard.sell_price})
                                </button>
                                {selectedCard.quantity > 1 && (
                                    <button type="button" className="collection-modal__sell" disabled={busy} onClick={() => setPendingSellAll(true)}>
                                        Vendre tout ×{selectedCard.quantity} (+{selectedCard.quantity * selectedCard.sell_price})
                                    </button>
                                )}
                            </div>

                            {lastSale > 0 && <p className="collection-modal__sale">+{lastSale} coins</p>}

                            {actionError && <p className="collection-modal__error">{actionError}</p>}

                            {selectedCard.can_report && (
                                <button type="button" className="collection-modal__report" onClick={() => setReporting(true)}>
                                    Signaler la carte
                                </button>
                            )}
                        </div>
                    </div>

                    {pendingSellAll !== null && (
                        <div
                            className="collection-confirm"
                            onClick={(e) => {
                                e.stopPropagation()
                                setPendingSellAll(null)
                            }}
                        >
                            <div
                                className="collection-confirm__box"
                                role="alertdialog"
                                aria-modal="true"
                                aria-labelledby="collection-confirm-title"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <p id="collection-confirm-title" className="collection-confirm__title">
                                    {pendingSellAll
                                        ? `Vendre les ${selectedCard.quantity} exemplaires de « ${selectedCard.name} » pour ${selectedCard.quantity * selectedCard.sell_price} coins ?`
                                        : `Vendre un exemplaire de « ${selectedCard.name} » pour ${selectedCard.sell_price} coins ?`}
                                </p>
                                <p className="collection-confirm__text">Cette action est définitive.</p>
                                <div className="collection-modal__actions">
                                    <button type="button" onClick={() => setPendingSellAll(null)} autoFocus>Annuler</button>
                                    <button type="button" className="collection-modal__sell" onClick={() => handleSell(selectedCard, pendingSellAll)}>
                                        Vendre
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {reporting && (
                        <ReportModal
                            target={{ kind: 'card', id: selectedCard.id, name: selectedCard.name }}
                            onClose={() => setReporting(false)}
                        />
                    )}
                </div>
            )}
        </section>
    )
}
