import type {User, RegisterData, LoginData} from "../types.ts"

type StoredUser = User & {mdp: string}

export function register(data: RegisterData): User {
    
    const email = data.email.trim().toLowerCase()

    if (data.pseudo.trim() === '') {
    throw new Error('Le pseudo est obligatoire')
    }

    const text = localStorage.getItem('users') ?? '[]'
    const users: StoredUser[] = JSON.parse(text)
    
    const emailExists = users.some(user => user.email === email)
    if (emailExists){
        throw new Error('Email déjà utilisé')
    }

    const newUser: StoredUser ={
        id: Date.now(),
        pseudo: data.pseudo.trim(),
        email: email,
        mdp: data.mdp,
    }

    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))

    return{
        id: newUser.id, 
        pseudo: newUser.pseudo, 
        email: newUser.email
    }
}

export function login(data: LoginData): User{
    const email = data.email.trim().toLowerCase()

    const text = localStorage.getItem('users') ?? '[]'
    const users: StoredUser[] = JSON.parse(text)

    const compteExists = users.find(user => user.email === email && user.mdp === data.mdp)
    if (!compteExists){
        throw new Error('Email ou le mot de passe est faux')
    }

    return {
        id: compteExists.id,
        pseudo: compteExists.pseudo,
        email: compteExists.email
    }
}