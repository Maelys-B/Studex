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
        <form onSubmit={handleSubmit}>
            <h1>Mon profil</h1>

            <h2>Modifier mon pseudo et email</h2>
            <div>
                <label htmlFor="profile-username">pseudo</label>
                <input
                    id="profile-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="profile-email">email</label>
                <input
                    id="profile-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {error && <p>{error}</p>}

            <button type="submit">Enregistrer</button>
        </form>
    )
}
