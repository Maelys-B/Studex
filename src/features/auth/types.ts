export type User = {
    readonly id: number,
    username: string,
    email: string,
    role: 'user' | 'admin',
}

export type LoginData = {
    email: string,
    password: string,
}

export type RegisterData = {
    username: string,
    email: string,
    password: string,
}