import {useState} from 'react'
import {login} from '../services/authService'

type LoginFormProps = {
    onConnexion: () => void,
    onAllerVersInscription: () => void,
}

export function LoginForm({onConnexion, onAllerVersInscription }: LoginFormProps) {
    const [email, setEmail] = useState('')
    const [mdp, setMdp] = useState('')
    const [erreur, setErreur] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErreur('')

        try {
            await login({email, mdp})
            onConnexion()
        } catch (err) {
            if (err instanceof Error) {
                setErreur(err.message)
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
                <label htmlFor="login-mdp">mot de passe</label>
                <input
                    id="login-mdp"
                    type="password"
                    required
                    value={mdp}
                    onChange={(e) => setMdp(e.target.value)}
                />
            </div>

            {erreur && <p>{erreur}</p>}

            <button type="submit">Envoyer</button>
            <button type="button" onClick={onAllerVersInscription}>Pas encore de compte ? S'inscrire</button>
        </form>
    )
}
