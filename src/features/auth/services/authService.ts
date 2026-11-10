import type {User, RegisterData, LoginData} from "../types.ts"

const API_URL = 'http://localhost:3000/api'

async function authenticate(route: string, data: LoginData | RegisterData): Promise<User> {
    let response: Response
    try {
        response = await fetch(`${API_URL}/auth/${route}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
    } catch {
        throw new Error('Erreur de connexion au serveur')
    }

    const json = await response.json()

    if (!response.ok) {
        throw new Error(json.error)
    }

    localStorage.setItem('token', json.token)
    return json.user
}

export function register(data: RegisterData): Promise<User> {
    return authenticate('register', data)
}

export function login(data: LoginData): Promise<User> {
    return authenticate('login', data)
}

export async function getProfile(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })

    if (!response.ok) {
        localStorage.removeItem('token')
        throw new Error('Session expirée')
    }

    const json = await response.json()
    return json.user
}
