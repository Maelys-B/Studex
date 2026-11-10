import {useState} from 'react'
import {updateProfil} from '../services/profileService'
import type {User} from '../../auth/types'
import type React from 'react';

type ProfilProps = {
    onModification: () => void,
    user: User
}

export function ProfilForm({onModification, user}:ProfilProps){
    const [pseudo, setPseudo] = useState(user.pseudo)
    const [email, setEmail] = useState(user.email)
    const [erreur, setErreur] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErreur('')

        try{
            await updateProfil({email, pseudo})
            onModification()
        } catch(err){
            if (err instanceof Error) {
                setErreur(err.message)
            }
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Mon profil</h2>

            <div>
                <label htmlFor="profil-pseudo">pseudo</label>
                <input
                    id="profil-pseudo"
                    type="text"
                    required
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="profil-email">email</label>
                <input
                    id="profil-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {erreur && <p>{erreur}</p>}

            <button type="submit">Enregistrer</button>
        </form>
    )
}
