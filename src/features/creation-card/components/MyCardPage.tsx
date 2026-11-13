import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Avatar, CardStatus } from '../../boosters/types'
import { CardView } from '../../boosters/components/CardView'
import { CardTilt } from '../../boosters/components/CardTilt'
import { AVATAR_CHOICES, AVATAR_COUNTS, DEFAULT_SKIN, POSES } from '../assets/avatarParts'
import type { AvatarChoice } from '../assets/avatarParts'
import { fetchMyCard, saveMyCard } from '../services/cardApi'
import fond from '../../boosters/assets/fond-booster.webp'
import '../assets/MyCardPage.css'

const DEFAULT_COLOR = '#2aa9ad'

const LABELS: Record<AvatarChoice, string> = {
    pose: 'Pose', hair: 'Cheveux', eyes: 'Yeux', mouth: 'Bouche', outfit: 'Tenue'
}

const STATUS_LABELS: Record<CardStatus, string> = {
    pending: 'En attente de validation',
    approved: 'Validée',
    rejected: 'Refusé: modifie ta carte pour la renvoyer'
}

const SPARK = 'M0 0C22 -5 52 -13 66 -9C74 -6 74 3 67 7C52 14 22 6 0 0Z'

function Sparks({ className = '' }: { className?: string }) {
    return (
        <svg className={`my-card__sparks ${className}`} viewBox="0 0 60 60" aria-hidden="true">
            <path d={SPARK} transform="translate(6 30) rotate(-58) scale(0.55)" />
            <path d={SPARK} transform="translate(8 34) rotate(-18) scale(0.62)" />
            <path d={SPARK} transform="translate(8 40) rotate(16) scale(0.5)" />
        </svg>
    )
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
    const [color, setColor] = useState(DEFAULT_COLOR)
    const [avatar, setAvatar] = useState<Avatar>({ pose: 0, skin: DEFAULT_SKIN, hair: 0, eyes: 0, mouth: 0, outfit: 0 })
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
        <section className="my-card">
            <div className="my-card__preview">
                <img className="my-card__bg" src={fond} alt="" draggable={false} />
                <CardTilt>
                    <CardView
                        card={{
                            id: 0,
                            name: firstName ? `${firstName}.${lastName.charAt(0).toUpperCase()}` : '',
                            position_collection: 0,
                            subtitle,
                            color,
                            avatar,
                            rarity: 'common',
                            type: 'student'
                        }}
                    />
                </CardTilt>
                {status && <p className="my-card__status">{STATUS_LABELS[status]}</p>}
            </div>

            <form className="my-card__panel" onSubmit={onSubmit}>
                {status === 'rejected' && (
                    <p className="my-card__rejected" role="alert">Ta carte a été refusée. Modifie-la pour continuer</p>
                )}
                <h1 className="my-card__title">
                    Ma carte
                    <Sparks />
                    <svg className="my-card__title-line" viewBox="0 0 240 24" preserveAspectRatio="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="my-card-swoosh">
                                <stop offset="0" stopColor="#fff" />
                                <stop offset="1" stopColor="#35d4e8" />
                            </linearGradient>
                        </defs>
                        <path d="M2 20C60 8 150 6 238 4L236 13C150 13 70 16 6 24Z" />
                    </svg>
                </h1>

                <fieldset className="my-card__group my-card__group--identity">
                    <legend>
                        <svg className="my-card__legend-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <circle cx="9" cy="11" r="2" />
                            <path d="M6 16c.6-1.6 5.4-1.6 6 0M15 10h3M15 14h3" />
                        </svg>
                        Identité
                    </legend>
                    <label>
                        Prénom
                        <input value={firstName} onChange={e => setFirstName(e.target.value)} maxLength={20} required />
                    </label>
                    <label>
                        Initiale du nom
                        <input value={lastName} onChange={e => setLastName(e.target.value)} maxLength={20} required />
                    </label>
                    <label className="my-card__wide">
                        Accroche
                        <input value={subtitle} onChange={e => setSubtitle(e.target.value)} maxLength={80} />
                    </label>
                </fieldset>

                <fieldset className="my-card__group my-card__group--colors">
                    <legend>
                        <svg className="my-card__legend-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-.8-1.6-.8-2.6 1-1.9 2.2-1.9H18a3 3 0 0 0 3-3c0-4.700-4-8.500-9-8.500Z" />
                            <circle cx="8" cy="10" r="1" />
                            <circle cx="12" cy="7.500" r="1" />
                            <circle cx="16" cy="9.500" r="1" />
                        </svg>
                        Couleurs
                    </legend>
                    <label className="my-card__skin">
                        Couleur du fond
                        <input
                            type="color"
                            value={color}
                            onChange={e => setColor(e.target.value)}
                        />
                    </label>
                    <label className="my-card__skin">
                        Couleur de peau
                        <input
                            type="color"
                            value={avatar.skin}
                            onChange={e => setAvatar(a => ({ ...a, skin: e.target.value }))}
                        />
                    </label>
                </fieldset>

                <fieldset className="my-card__group my-card__group--avatar">
                    <legend>
                        <svg className="my-card__legend-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21c1-5 15-5 16 0" />
                        </svg>
                        Avatar
                    </legend>
                    {AVATAR_CHOICES.map(category => (
                        <div className="my-card__choice" key={category}>
                            <span className="my-card__choice-label">{LABELS[category]}</span>
                            <button
                                type="button"
                                className="my-card__step"
                                aria-label={`${LABELS[category]} précédent`}
                                onClick={() => cycle(category, -1)}
                            >
                                ◀
                            </button>
                            <span className="my-card__choice-value">
                                {category === 'pose' ? POSES[avatar.pose].label : `${avatar[category] + 1} / ${AVATAR_COUNTS[category]}`}
                            </span>
                            <button
                                type="button"
                                className="my-card__step"
                                aria-label={`${LABELS[category]} suivant`}
                                onClick={() => cycle(category, 1)}
                            >
                                ▶
                            </button>
                        </div>
                    ))}
                </fieldset>

                {error && <p className="my-card__error">{error}</p>}
                <div className="my-card__submit-row">
                    <Sparks className="my-card__sparks--left" />
                    <button className="my-card__submit" type="submit" disabled={saving}>
                        <svg className="my-card__submit-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <circle cx="8" cy="11" r="2" />
                            <path d="M5 16c.7-1.800 5.300-1.800 6 0M14 10h5M14 14h5" />
                        </svg>
                        {exists ? 'Modifier ma carte' : 'Créer ma carte'}
                    </button>
                    <Sparks className="my-card__sparks--right" />
                </div>
            </form>
        </section>
    )
}
