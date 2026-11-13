import {useState} from 'react'
import {login} from '../services/authService'

type LoginFormProps = {
    onLogin: () => void,
    onGoToRegister: () => void,
}

export function LoginForm({onLogin, onGoToRegister }: LoginFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            await login({email, password})
            onLogin()
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            }
        }
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
                <label htmlFor="login-password">mot de passe</label>
                <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {error && <p>{error}</p>}

            <button type="submit">Envoyer</button>
            <button type="button" onClick={onGoToRegister}>Pas encore de compte ? S'inscrire</button>
        </form>
    )
}
