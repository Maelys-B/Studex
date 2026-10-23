import {useState} from 'react'
import type {RegisterData} from '../types'

type RegisterFormProps = {
    onRegister: (data: RegisterData) => void,
    error: string | null,
}

export function RegisterForm({ onRegister, error }: RegisterFormProps) {
    const [email, setEmail] = useState('')
    const [mdp, setMdp] = useState('')
    const [pseudo, setPseudo] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onRegister({email, mdp, pseudo})
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Inscription</h2>

            <div>
                <label htmlFor="register-email">email</label>
                <input
                    id="register-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="register-mdp">mot de passe</label>
                <input
                    id="register-mdp"
                    type="password"
                    required
                    value={mdp}
                    onChange={(e) => setMdp(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="register-pseudo">pseudo</label>
                <input
                    id="register-pseudo"
                    type="text"
                    required
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                />
            </div>

            {error && <p>{error}</p>}
            

            <button type="submit">Envoyer</button>
        </form>
    )
}
