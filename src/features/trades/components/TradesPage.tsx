import { useEffect, useState } from 'react'
import { acceptTrade, cancelTrade, declineTrade, fetchTrades } from '../services/tradesApi'
import type { Trade, TradeSide } from '../types'
import { PageTitle } from '../../ui/components/PageTitle'
import '../assets/TradesPage.css'

const RARITY_LABEL = {
    common: 'Commune',
    uncommon: 'Peu commune',
    rare: 'Rare',
    epic: 'Épique',
    legendary: 'Légendaire',
}

function SideContent({ title, side }: { title: string, side: TradeSide }) {
    const isEmpty = side.coins === 0 && side.cards.length === 0

    return (
        <div className="trade-side">
            <h3 className="trade-side__title">{title}</h3>
            {isEmpty && <p className="trade-side__empty">Rien</p>}
            <ul className="trade-side__list">
                {side.coins > 0 && <li className="trade-side__coins">{side.coins} coins</li>}
                {side.cards.map(card => (
                    <li className="trade-side__card" key={card.id}>
                        <span className={`trade-rarity trade-rarity--${card.rarity}`}>{RARITY_LABEL[card.rarity]}</span>
                        <span className="trade-side__name">{card.name}</span>
                        {card.quantity > 1 && <span className="trade-side__quantity">×{card.quantity}</span>}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export function TradesPage() {
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchTrades()
            .then(setTrades)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const run = async (action: () => Promise<unknown>) => {
        setError(null)
        try {
            await action()
            setTrades(await fetchTrades())
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur serveur')
        }
    }

    if (loading) return <p className="page-loading">Chargement ...</p>

    const toAnswer = trades.filter(trade => trade.myTurn)
    const waiting = trades.filter(trade => !trade.myTurn)

    const renderTrade = (trade: Trade) => (
        <li className="trade-card" key={trade.id}>
            <div className="trade-card__head">
                <span className="trade-card__partner">{trade.partner.username}</span>
                <span className="trade-card__date">{new Date(trade.updated_at).toLocaleDateString('fr-FR')}</span>
            </div>

            <div className="trade-card__sides">
                <SideContent title="Tu donnes" side={trade.give} />
                <SideContent title="Tu reçois" side={trade.receive} />
            </div>

            <div className="trade-card__actions">
                {trade.myTurn ? (
                    <>
                        <button className="holo-btn holo-btn--accept" onClick={() => run(() => acceptTrade(trade.id))}>Accepter</button>
                        <button className="holo-btn holo-btn--danger" onClick={() => run(() => declineTrade(trade.id))}>Refuser</button>
                    </>
                ) : (
                    <button className="holo-btn holo-btn--ghost" onClick={() => run(() => cancelTrade(trade.id))}>Annuler</button>
                )}
            </div>
        </li>
    )

    return (
        <section className="page-shell trades">
            <PageTitle>Échanges</PageTitle>
            {error && <p className="page-error">{error}</p>}

            <div className="trades__grid">
                <section className="holo-panel holo-panel--glass">
                    <h2 className="holo-panel__legend">
                        <span>À toi de répondre</span>
                        <span className="holo-panel__count">{toAnswer.length}</span>
                    </h2>
                    <ul className="trades__list">
                        {toAnswer.length === 0 && <li className="holo-panel__empty">Aucun échange en attente de ta réponse.</li>}
                        {toAnswer.map(renderTrade)}
                    </ul>
                </section>

                <section className="holo-panel holo-panel--glass">
                    <h2 className="holo-panel__legend">
                        <span>En attente de ton ami</span>
                        <span className="holo-panel__count">{waiting.length}</span>
                    </h2>
                    <ul className="trades__list">
                        {waiting.length === 0 && <li className="holo-panel__empty">Aucune proposition envoyée.</li>}
                        {waiting.map(renderTrade)}
                    </ul>
                </section>
            </div>
        </section>
    )
}
