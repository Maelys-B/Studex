import bcrypt from 'bcryptjs'
import { HttpError } from '../errors/HttpError.js'
import { isUniqueViolation } from '../lib/prisma.js'
import { userRepository } from '../repositories/user.repository.js'

export const profileService = {
    async update(userId: number, email: string, username: string) {
        if (await userRepository.isEmailTaken(email, userId)) {
            throw new HttpError(409, 'Email déjà existant')
        }

        try {
            return await userRepository.updateProfile(userId, { email, username })
        } catch (err) {
            if (isUniqueViolation(err)) throw new HttpError(409, 'Email déjà existant')
            throw err
        }
    },

    async changePassword(userId: number, oldPassword: string, newPassword: string) {
        const user = await userRepository.findPassword(userId)
        if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
            throw new HttpError(401, 'Identifiants incorrects')
        }

        await userRepository.updatePassword(userId, await bcrypt.hash(newPassword, 10))
    },
}
