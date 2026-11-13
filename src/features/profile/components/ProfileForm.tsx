import {useState} from 'react'
import {updateProfile} from '../services/profileService'
import type {User} from '../../auth/types'
import type React from 'react';

type ProfileProps = {
    onUpdate: () => void,
    user: User
}

export function ProfileForm({onUpdate, user}:ProfileProps){
    const [username, setUsername] = useState(user.username)
    const [email, setEmail] = useState(user.email)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try{
            await updateProfile({email, username})
            onUpdate()
        } catch(err){
            if (err instanceof Error) {
                setError(err.message)
            }
        }
    }

    return (
        <form className="holo-panel holo-panel--glass profile-form" onSubmit={handleSubmit}>
            <h2 className="holo-panel__legend">
                <svg className="holo-panel__icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-5 15-5 16 0" /></svg>
                <span>Mon compte</span>
            </h2>

            <div className="profile-form__field">
                <label htmlFor="profile-username">Pseudo</label>
                <input
                    id="profile-username"
                    className="holo-input"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div className="profile-form__field">
                <label htmlFor="profile-email">Email</label>
                <input
                    id="profile-email"
                    className="holo-input"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {error && <p className="profile-form__error" role="alert">{error}</p>}

            <button className="holo-btn holo-btn--accept profile-form__submit" type="submit">Enregistrer</button>
        </form>
    )
}
