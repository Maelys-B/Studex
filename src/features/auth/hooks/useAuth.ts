import { useState } from 'react'
import type { User, LoginData, RegisterData } from '../types'
import { register, login } from '../services/authService'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleRegister = (data: RegisterData) => {
        try {
            const newUser = register(data)

            setUser(newUser)
            setError(null)
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            }
        }
    }

    const handleLogin = (data: LoginData) => {
        try {
            const loggedUser = login(data)

            setUser(loggedUser)
            setError(null)
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            }
        }
    }

    const logout = () => {
        setUser(null)
    }

    const clearError = () => {
        setError(null)
    }
    return { user, error, handleLogin, handleRegister, logout, clearError }

}