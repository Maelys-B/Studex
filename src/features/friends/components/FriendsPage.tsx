import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { answerRequest, fetchFriends, fetchRequests, removeFriend, searchUsers, sendRequest } from '../services/friendsApi'
import type { Friend, FriendRequest, SearchResult } from '../services/friendsApi'

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
        <section>
            <h1>Amis</h1>
            {error && <p>{error}</p>}

            <form onSubmit={onSearch}>
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Rechercher un pseudo"
                    maxLength={50}
                />
                <button type="submit">Rechercher</button>
            </form>

            {results && (
                <ul>
                    {results.length === 0 && <li>Aucun joueur trouvé.</li>}
                    {results.map(r => (
                        <li key={r.id}>
                            {r.username}{' '}
                            {r.relation === 'none' && (
                                <button onClick={() => run(() => sendRequest(r.id))}>Ajouter</button>
                            )}
                            {r.relation === 'sent' && <span>Demande envoyée</span>}
                            {r.relation === 'received' && <span>T'a envoyé une demande</span>}
                            {r.relation === 'friends' && <span>Déjà ami</span>}
                        </li>
                    ))}
                </ul>
            )}

            <h2>Demandes reçues</h2>
            <ul>
                {requests.length === 0 && <li>Aucune demande.</li>}
                {requests.map(r => (
                    <li key={r.id}>
                        {r.username}{' '}
                        <button onClick={() => run(() => answerRequest(r.id, 'accepted'))}>Accepter</button>
                        <button onClick={() => run(() => answerRequest(r.id, 'rejected'))}>Refuser</button>
                    </li>
                ))}
            </ul>

            <h2>Mes amis</h2>
            <ul>
                {friends.length === 0 && <li>Pas encore d'amis.</li>}
                {friends.map(f => (
                    <li key={f.id}>
                        {f.username}{' '}
                        <button onClick={() => run(() => removeFriend(f.id))}>Retirer</button>
                    </li>
                ))}
            </ul>
        </section>
    )
} 