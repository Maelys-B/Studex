import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { HttpError } from '../errors/HttpError.js'
import { isUniqueViolation } from '../lib/prisma.js'
import { userRepository } from '../repositories/user.repository.js'
import type { PublicUser } from '../types.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET missing from .env')
}

function signToken(userId: number) {
    return jwt.sign({ userId }, JWT_SECRET!, { expiresIn: '24h' })
}

export const authService = {
    async register(email: string, password: string, username: string) {
        if (await userRepository.isEmailTaken(email)) {
            throw new HttpError(409, 'Email déjà existant')
        }

        const hash = await bcrypt.hash(password, 10)

        let user: PublicUser
        try {
            user = await userRepository.create({ email, password: hash, username })
        } catch (err) {
            if (isUniqueViolation(err)) throw new HttpError(409, 'Email déjà existant')
            throw err
        }

        return { token: signToken(user.id), user }
    },

    async login(email: string, password: string) {
        const user = await userRepository.findByEmail(email)
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new HttpError(401, 'Identifiants incorrects')
        }

        const publicUser: PublicUser = { id: user.id, username: user.username, email: user.email, role: user.role, coins: user.coins }
        return { token: signToken(user.id), user: publicUser }
    },

    async getProfile(userId: number) {
        const user = await userRepository.findPublicById(userId)
        if (!user) throw new HttpError(401, 'Veuillez vous reconnecter')
        return user
    },
}
