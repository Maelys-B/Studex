import {useState} from 'react'
import {register} from '../services/authService'

type RegisterFormProps = {
    onInscription: () => void,
    onAllerVersConnexion: () => void,
}

export function RegisterForm({ onInscription, onAllerVersConnexion }: RegisterFormProps) {
    const [email, setEmail] = useState('')
    const [mdp, setMdp] = useState('')
    const [pseudo, setPseudo] = useState('')
    const [erreur, setErreur] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErreur('')

        try {
            await register({email, mdp, pseudo})
            onInscription()
        } catch (err) {
            if (err instanceof Error) {
                setErreur(err.message)
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

            {erreur && <p>{erreur}</p>}

            <button type="submit">Envoyer</button>
            <button type="button" onClick={onAllerVersConnexion}>Déjà un compte ? Se connecter</button>
        </form>
    )
}
