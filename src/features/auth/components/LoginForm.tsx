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
        <form className="holo-panel holo-panel--glass auth-form" onSubmit={handleSubmit}>
            <h2 className="holo-panel__legend">
                <svg className="holo-panel__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h10" /></svg>
                <span>Connexion</span>
            </h2>

            <div className="auth-form__field">
                <label htmlFor="login-email">Email</label>
                <input
                    id="login-email"
                    className="holo-input"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="auth-form__field">
                <label htmlFor="login-password">Mot de passe</label>
                <input
                    id="login-password"
                    className="holo-input"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {error && <p className="auth-form__error" role="alert">{error}</p>}

            <button className="holo-btn auth-form__submit" type="submit">Envoyer</button>
            <button className="auth-form__switch" type="button" onClick={onGoToRegister}>Pas encore de compte ? S'inscrire</button>
        </form>
    )
}
