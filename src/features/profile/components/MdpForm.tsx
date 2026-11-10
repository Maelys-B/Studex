import {updateMdp} from '../services/profileService'
import {useState} from 'react'
import type React from 'react';

type MdpProps = {
    onModification: () => void,
}

export function MdpForm({onModification}:MdpProps){
    const [ancienMdp, setAncienMdp] = useState('')
    const [nouveauMdp, setNouveauMdp] = useState('')
    const [erreur, setErreur] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErreur('')

        try{
            await updateMdp({ancienMdp, nouveauMdp})
            onModification()
            setAncienMdp('')
            setNouveauMdp('')
        } catch(err){
            if (err instanceof Error) {
                setErreur(err.message)
            }
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Changer mon mot de passe</h2>

            <div>
                <label htmlFor="profil-ancien-mdp">Ancien mot de passe</label>
                <input
                    id="profil-ancien-mdp"
                    type="password"
                    required
                    value={ancienMdp}
                    onChange={(e) => setAncienMdp(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="profil-nouveau-mdp">Nouveau mot de passe</label>
                <input
                    id="profil-nouveau-mdp"
                    type="password"
                    required
                    value={nouveauMdp}
                    onChange={(e) => setNouveauMdp(e.target.value)}
                />
            </div>

            {erreur && <p>{erreur}</p>}

            <button type="submit">Enregistrer</button>
        </form>
    )
}
