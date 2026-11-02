export type User = {
    readonly id: number,
    pseudo: string,
    email: string,
    role: 'user' | 'admin',
}

export type LoginData = {
    email: string,
    mdp: string,
}

export type RegisterData = {
    pseudo: string,
    email: string,
    mdp: string,
}