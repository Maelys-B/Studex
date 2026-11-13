import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Avatar, CardStatus } from '../../boosters/types'
import { CardView } from '../../boosters/components/CardView'
import { AVATAR_CHOICES, AVATAR_COUNTS, DEFAULT_SKIN, POSES } from '../assets/avatarParts'
import type { AvatarChoice } from '../assets/avatarParts'
import { fetchMyCard, saveMyCard } from '../services/cardApi'

const DEFAULT_COLOR = '#2aa9ad' 

const LABELS: Record<AvatarChoice, string> = {
    pose: 'Pose', hair: 'Cheveux', eyes: 'Yeux', mouth: 'Bouche', outfit: 'Tenue'
}

const STATUS_LABELS: Record<CardStatus, string> = {
    pending: 'En attente de validation',
    approved: 'Validée',
    rejected: 'Refusé: modifie ta carte pour la renvoyer'
}

type MyCardPageProps = {
    onSaved?: () => void
}

export function MyCardPage({ onSaved }: MyCardPageProps) {
    const [loading, setLoading] = useState(true)
    const [exists, setExists] = useState(false)
    const [status, setStatus] = useState<CardStatus | null>(null)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [subtitle, setSubtitle] = useState('')
    const [avatar, setAvatar] = useState<Avatar>({ pose: 0, skin: DEFAULT_SKIN, hair: 0, eyes: 0, mouth: 0, outfit: 0 })
    const [color, setColor] = useState(DEFAULT_COLOR)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchMyCard()
            .then(card => {
                if (!card) return
                const [first, last] = card.name.split('.')
                setFirstName(first)
                setLastName(last ?? '')
                setSubtitle(card.subtitle ?? '')
                setColor(card.color)
                setAvatar(card.avatar)
                setStatus(card.status)
                setExists(true)
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const cycle = (category: AvatarChoice, step: number) =>
        setAvatar(a => {
            const count = AVATAR_COUNTS[category]
            if(count === 0) return a
            return { ...a, [category]: (a[category] + step + count) % count}
        })

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setSaving(true)
        try {
            await saveMyCard(
                { first_name: firstName, last_name: lastName, subtitle, color, avatar },
                exists
            )
            setExists(true)
            setStatus('pending')
            onSaved?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur serveur')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <p>Chargement...</p>

    return (
        <section>
            {status === 'rejected' && (
                <h1>Ta carte a été refusée. Modifie-la pour continuer</h1>
            )}
            <h2>Ma carte</h2>
            {status && <p>Statut : {STATUS_LABELS[status]}</p>}

            <CardView
                card={{
                    id: 0,
                    name: `${firstName}.${lastName.charAt(0).toUpperCase()}`,
                    position_collection: 0,
                    subtitle,
                    color,
                    avatar,
                    rarity: 'common',
                    type: 'student'
                }}
            />


            <form onSubmit={onSubmit}>
                <label>
                    Prénom
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} maxLength={20} required />
                </label>
                <label>
                    Initiale du nom 
                    <input value={lastName} onChange={e => setLastName(e.target.value)} maxLength={20} required />
                </label>
                <label>
                    Accroche 
                    <input value={subtitle} onChange={e => setSubtitle(e.target.value)} maxLength={80} />
                </label>

                <div>
                    Couleur du fond
                    <input
                        type="color"
                        value={color}
                        onChange={e => setColor( e.target.value )}
                    />
                </div>

                <label>
                    Couleur de peau
                    <input
                        type="color"
                        value={avatar.skin}
                        onChange={e => setAvatar(a => ({ ...a, skin: e.target.value }))}
                    />
                </label>

                {AVATAR_CHOICES.map(category => (
                    <div key={category}>
                        <button type="button" onClick={() => cycle(category, -1)}>◀</button>
                        <span>
                            {LABELS[category]} {category === 'pose' ? POSES[avatar.pose].label : `${avatar[category] + 1} / ${AVATAR_COUNTS[category]}`}
                        </span>
                        <button type="button" onClick={() => cycle(category, 1)}>▶</button>
                    </div>
                ))}

                {error && <p>{error}</p>}
                <button type="submit" disabled={saving}>
                    {exists ? 'Modifier ma carte' : 'Créer ma carte'}
                </button>
            </form>
        </section>
    )
}