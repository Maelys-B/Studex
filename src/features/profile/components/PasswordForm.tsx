import {updatePassword} from '../services/profileService'
import {useState} from 'react'
import type React from 'react';

type PasswordProps = {
    onUpdate: () => void,
}

export function PasswordForm({onUpdate}:PasswordProps){
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try{
            await updatePassword({oldPassword, newPassword})
            onUpdate()
            setOldPassword('')
            setNewPassword('')
        } catch(err){
            if (err instanceof Error) {
                setError(err.message)
            }
        }
    }

    return (
        <form className="holo-panel holo-panel--glass profile-form" onSubmit={handleSubmit}>
            <h2 className="holo-panel__legend">
                <svg className="holo-panel__icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                <span>Mot de passe</span>
            </h2>

            <div className="profile-form__field">
                <label htmlFor="profile-old-password">Ancien mot de passe</label>
                <input
                    id="profile-old-password"
                    className="holo-input"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
            </div>

            <div className="profile-form__field">
                <label htmlFor="profile-new-password">Nouveau mot de passe</label>
                <input
                    id="profile-new-password"
                    className="holo-input"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>

            {error && <p className="profile-form__error" role="alert">{error}</p>}

            <button className="holo-btn holo-btn--accept profile-form__submit" type="submit">Enregistrer</button>
        </form>
    )
}
