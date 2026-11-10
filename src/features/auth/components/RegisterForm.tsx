import {useState} from 'react'
import {register} from '../services/authService'

type RegisterFormProps = {
    onRegister: () => void,
    onGoToLogin: () => void,
}

export function RegisterForm({ onRegister, onGoToLogin }: RegisterFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            await register({email, password, username})
            onRegister()
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            }
        }
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
                <label htmlFor="register-password">mot de passe</label>
                <input
                    id="register-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="register-username">pseudo</label>
                <input
                    id="register-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            {error && <p>{error}</p>}

            <button type="submit">Envoyer</button>
            <button type="button" onClick={onGoToLogin}>Déjà un compte ? Se connecter</button>
        </form>
    )
}
