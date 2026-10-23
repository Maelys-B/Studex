import {useState} from 'react'
import type {LoginData} from '../types'

type LoginFormProps = {
    onLogin: (data: LoginData) => void,
    error: string | null,
}

export function LoginForm({ onLogin, error }: LoginFormProps) {
    const [email, setEmail] = useState('')
    const [mdp, setMdp] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onLogin({email, mdp})
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Connexion</h2>

            <div>
                <label htmlFor="login-email">email</label>
                <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="login-mdp">mot de passe</label>
                <input
                    id="login-mdp"
                    type="password"
                    required
                    value={mdp}
                    onChange={(e) => setMdp(e.target.value)}
                />
            </div>

            {error && <p>{error}</p>}

            <button type="submit">Envoyer</button>
        </form>
    )
}
