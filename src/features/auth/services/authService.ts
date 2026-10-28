import type {User, RegisterData, LoginData} from "../types.ts"

const API_URL = 'http://localhost:3000/api'

async function authentifier(route: string, data: LoginData | RegisterData): Promise<User> {
    let reponse: Response
    try {
        reponse = await fetch(`${API_URL}/auth/${route}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
    } catch {
        throw new Error('Erreur de connexion au serveur')
    }

    const json = await reponse.json()

    if (!reponse.ok) {
        throw new Error(json.erreur)
    }

    localStorage.setItem('token', json.token)
    return json.user
}

export function register(data: RegisterData): Promise<User> {
    return authentifier('register', data)
}

export function login(data: LoginData): Promise<User> {
    return authentifier('login', data)
}

export async function getProfil(): Promise<User> {
    const reponse = await fetch(`${API_URL}/auth/profil`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })

    if (!reponse.ok) {
        localStorage.removeItem('token')
        throw new Error('Session expirée')
    }

    const json = await reponse.json()
    return json.user
}
