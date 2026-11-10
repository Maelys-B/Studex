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
        <form onSubmit={handleSubmit}>
            <h2>Changer mon mot de passe</h2>

            <div>
                <label htmlFor="profile-old-password">Ancien mot de passe</label>
                <input
                    id="profile-old-password"
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="profile-new-password">Nouveau mot de passe</label>
                <input
                    id="profile-new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>

            {error && <p>{error}</p>}

            <button type="submit">Enregistrer</button>
        </form>
    )
}
