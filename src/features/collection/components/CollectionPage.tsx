import { useEffect, useState } from 'react'
import { deleteCards, fetchCollection } from '../services/collectionService'
import { CardView } from '../../boosters/components/CardView'
import { CollectionCardView } from '../../boosters/components/CollectionCardView'
import { BattleCardView } from '../../boosters/components/BattleCardView'
import { CardTilt } from '../../boosters/components/CardTilt'
import type { Card, CardKind, Rarity } from '../../boosters/types'
import type { OwnedCard } from '../types'
import '../assets/CollectionPage.css'

type TypeFilter = 'tous' | CardKind
type SortOrder = 'recent' | 'ancien' | 'rarete' | 'quantite'

const RARITY_ORDER: Rarity[] = ['commun', 'uncommun', 'rare', 'epic', 'legendary']

function CardByType({ card }: { card: Card }) {
    if (card.type === 'collection') {
        return <CollectionCardView card={card} />
    }
    if (card.type === 'battle') {
        return <BattleCardView card={card} />
    }
    return <CardView card={card} />
}

function sortCards(cards: OwnedCard[], order: SortOrder): OwnedCard[] {
    return [...cards].sort((a, b) => {
        if (order === 'recent') {
            return b.obtained_at.localeCompare(a.obtained_at)
        }
        if (order === 'ancien') {
            return a.obtained_at.localeCompare(b.obtained_at)
        }
        if (order === 'quantite') {
            return b.quantity - a.quantity
        }
        return RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity)
    })
}

export function CollectionPage() {
    const [cards, setCards] = useState<OwnedCard[]>([])
    const [error, setError] = useState('')
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('tous')
    const [sortOrder, setSortOrder] = useState<SortOrder>('recent')
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')
    const [confirmTout, setConfirmTout] = useState<boolean | null>(null)

    useEffect(() => {
        fetchCollection()
            .then(setCards)
            .catch(err => setError(err.message))
    }, [])

    const selectedCard = cards.find(card => card.id === selectedId) ?? null

    const closeModal = () => {
        setSelectedId(null)
        setDeleteError('')
        setConfirmTout(null)
    }

    useEffect(() => {
        if (selectedId === null) {
            return
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') {
                return
            }
            if (confirmTout !== null) {
                setConfirmTout(null)
            } else {
                closeModal()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [selectedId, confirmTout])

    const handleDelete = async (card: OwnedCard, tout: boolean) => {
        setConfirmTout(null)
        setDeleting(true)
        setDeleteError('')
        try {
            await deleteCards([card.id], tout)
            setCards(current => current
                .map(c => c.id === card.id ? { ...c, quantity: tout ? 0 : c.quantity - 1 } : c)
                .filter(c => c.quantity > 0)
            )
        } catch (err) {
            if (err instanceof Error) {
                setDeleteError(err.message)
            }
        } finally {
            setDeleting(false)
        }
    }

    if (error) {
        return <p className="collection-page__error">{error}</p>
    }

    if (cards.length === 0) {
        return <p className="collection-page__empty">Aucune carte pour l'instant, ouvre un booster !</p>
    }

    const filteredCards = typeFilter === 'tous' ? cards : cards.filter(card => card.type === typeFilter)
    const visibleCards = sortCards(filteredCards, sortOrder)

    return (
        <section className="collection-page">
            <div className="collection-page__filters">
                <label>
                    Type
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}>
                        <option value="tous">Tous</option>
                        <option value="collection">Collection</option>
                        <option value="battle">Combat</option>
                        <option value="student">Étudiant</option>
                    </select>
                </label>

                <label>
                    Trier par
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}>
                        <option value="recent">Plus récentes</option>
                        <option value="ancien">Plus anciennes</option>
                        <option value="rarete">Rareté</option>
                        <option value="quantite">Quantité</option>
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
                                <button type="button" className="collection-modal__danger" disabled={deleting} onClick={() => setConfirmTout(false)}>
                                    Supprimer un exemplaire
                                </button>
                                {selectedCard.quantity > 1 && (
                                    <button type="button" className="collection-modal__danger" disabled={deleting} onClick={() => setConfirmTout(true)}>
                                        Supprimer tout (×{selectedCard.quantity})
                                    </button>
                                )}
                            </div>

                            {deleteError && <p className="collection-modal__error">{deleteError}</p>}
                        </div>
                    </div>

                    {confirmTout !== null && (
                        <div
                            className="collection-confirm"
                            onClick={(e) => {
                                e.stopPropagation()
                                setConfirmTout(null)
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
                                    {confirmTout
                                        ? `Supprimer les ${selectedCard.quantity} exemplaires de « ${selectedCard.name} » ?`
                                        : `Supprimer un exemplaire de « ${selectedCard.name} » ?`}
                                </p>
                                <p className="collection-confirm__text">Cette action est définitive.</p>
                                <div className="collection-modal__actions">
                                    <button type="button" onClick={() => setConfirmTout(null)} autoFocus>Annuler</button>
                                    <button type="button" className="collection-modal__danger" onClick={() => handleDelete(selectedCard, confirmTout)}>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}
