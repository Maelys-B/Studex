import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { answerRequest, fetchFriends, fetchRequests, removeFriend, searchUsers, sendRequest } from '../services/friendsApi'
import type { Friend, FriendRequest, SearchResult } from '../services/friendsApi'
import { PageTitle } from '../../ui/components/PageTitle'
import fond from '../../boosters/assets/fond-booster.webp'
import '../assets/FriendsPage.css'

function Initial({ pseudo }: { pseudo: string }) {
    return <span className="friend-row__avatar" aria-hidden="true">{pseudo.charAt(0).toUpperCase()}</span>
}

export function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([])
    const [requests, setRequests] = useState<FriendRequest[]>([])
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    const reload = async () => {
        const [f, r] = await Promise.all([fetchFriends(), fetchRequests()])
        setFriends(f)
        setRequests(r)
    }

    useEffect(() => {
        Promise.all([fetchFriends(), fetchRequests()])
            .then(([f, r]) => {
                setFriends(f)
                setRequests(r)
            })
            .catch(err => setError(err.message))
    }, [])

    const run = async (action: () => Promise<unknown>) => {
        setError(null)
        try {
            await action()
            await reload()
            if (results) setResults(await searchUsers(query.trim()))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur serveur')
        }
    }

    const onSearch = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        try {
            setResults(await searchUsers(query.trim()))
        } catch (err) {
            setResults(null)
            setError(err instanceof Error ? err.message : 'Erreur serveur')
        }
    }

    return (
        <section className="page-shell friends">
            <img className="page-bg" src={fond} alt="" draggable={false} />
            <PageTitle>Amis</PageTitle>
            {error && <p className="page-error">{error}</p>}

            <div className="friends__grid">
                <div className="friends__column">
                    <section className="holo-panel">
                        <h2 className="holo-panel__legend">
                            <svg className="holo-panel__icon" viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="11" cy="11" r="6" />
                                <path d="m20 20-4.5-4.5" />
                            </svg>
                            <span>Rechercher un joueur</span>
                        </h2>

                        <form className="friends__search" onSubmit={onSearch}>
                            <input
                                className="holo-input"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Rechercher un pseudo"
                                maxLength={50}
                            />
                            <button className="holo-btn holo-btn--accept" type="submit">Rechercher</button>
                        </form>

                        {results && (
                            <ul className="friends__list">
                                {results.length === 0 && <li className="holo-panel__empty">Aucun joueur trouvé.</li>}
                                {results.map(r => (
                                    <li className="friend-row" key={r.id}>
                                        <Initial pseudo={r.pseudo} />
                                        <span className="friend-row__name">{r.pseudo}</span>
                                        {r.relation === 'none' && (
                                            <button className="holo-btn holo-btn--accept" onClick={() => run(() => sendRequest(r.id))}>
                                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                                                Ajouter
                                            </button>
                                        )}
                                        {r.relation === 'sent' && <span className="friend-row__tag">Demande envoyée</span>}
                                        {r.relation === 'received' && <span className="friend-row__tag friend-row__tag--received">T'a envoyé une demande</span>}
                                        {r.relation === 'friends' && <span className="friend-row__tag friend-row__tag--friends">Déjà ami</span>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="holo-panel">
                        <h2 className="holo-panel__legend">
                            <svg className="holo-panel__icon" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
                            </svg>
                            <span>Demandes reçues</span>
                            <span className="holo-panel__count">{requests.length}</span>
                        </h2>
                        <ul className="friends__list">
                            {requests.length === 0 && <li className="holo-panel__empty">Aucune demande.</li>}
                            {requests.map(r => (
                                <li className="friend-row" key={r.id}>
                                    <Initial pseudo={r.pseudo} />
                                    <span className="friend-row__name">{r.pseudo}</span>
                                    <div className="friend-row__actions">
                                        <button className="holo-btn holo-btn--accept" onClick={() => run(() => answerRequest(r.id, 'accepted'))}>
                                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                                            Accepter
                                        </button>
                                        <button className="holo-btn holo-btn--danger" onClick={() => run(() => answerRequest(r.id, 'rejected'))}>
                                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                                            Refuser
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <section className="holo-panel friends__mine">
                    <h2 className="holo-panel__legend">
                        <svg className="holo-panel__icon" viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="9" cy="8" r="3.5" />
                            <path d="M2.5 20c.8-4.500 12.200-4.500 13 0M16 4.500a3.500 3.500 0 0 1 0 7M18 15c2 .6 3.200 2.300 3.500 5" />
                        </svg>
                        <span>Mes amis</span>
                        <span className="holo-panel__count">{friends.length}</span>
                    </h2>
                    <ul className="friends__list">
                        {friends.length === 0 && <li className="holo-panel__empty">Pas encore d'amis.</li>}
                        {friends.map(f => (
                            <li className="friend-row" key={f.id}>
                                <Initial pseudo={f.pseudo} />
                                <span className="friend-row__name">{f.pseudo}</span>
                                <button className="holo-btn holo-btn--ghost" onClick={() => run(() => removeFriend(f.id))}>Retirer</button>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </section>
    )
}
