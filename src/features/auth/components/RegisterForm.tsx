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
        <form className="holo-panel holo-panel--glass auth-form" onSubmit={handleSubmit}>
            <h2 className="holo-panel__legend">
                <svg className="holo-panel__icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="8" r="4" /><path d="M3 21c1-5 13-5 14 0M19 8v6M16 11h6" /></svg>
                <span>Inscription</span>
            </h2>

            <div className="auth-form__field">
                <label htmlFor="register-email">Email</label>
                <input
                    id="register-email"
                    className="holo-input"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="auth-form__field">
                <label htmlFor="register-password">Mot de passe</label>
                <input
                    id="register-password"
                    className="holo-input"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="auth-form__field">
                <label htmlFor="register-username">Pseudo</label>
                <input
                    id="register-username"
                    className="holo-input"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            {error && <p className="auth-form__error" role="alert">{error}</p>}

            <button className="holo-btn auth-form__submit" type="submit">Envoyer</button>
            <button className="auth-form__switch" type="button" onClick={onGoToLogin}>Déjà un compte ? Se connecter</button>
        </form>
    )
}
