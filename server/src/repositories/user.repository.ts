import { prisma } from '../lib/prisma.js'

/** Champs d'un joueur qu'on peut renvoyer au front (jamais le mot de passe). */
const publicFields = { id: true, username: true, email: true, role: true } as const

export const userRepository = {
    findRole(id: number) {
        return prisma.user.findUnique({ where: { id }, select: { role: true } })
    },

    findPublicById(id: number) {
        return prisma.user.findUnique({ where: { id }, select: publicFields })
    },

    findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } })
    },

    findPassword(id: number) {
        return prisma.user.findUnique({ where: { id }, select: { password: true } })
    },

    async isEmailTaken(email: string, exceptUserId?: number) {
        const user = await prisma.user.findFirst({
            where: { email, ...(exceptUserId !== undefined && { id: { not: exceptUserId } }) },
            select: { id: true },
        })
        return user !== null
    },

    create(data: { email: string, password: string, username: string }) {
        return prisma.user.create({ data, select: publicFields })
    },

    updateProfile(id: number, data: { email: string, username: string }) {
        return prisma.user.update({ where: { id }, data, select: publicFields })
    },

    updatePassword(id: number, password: string) {
        return prisma.user.update({ where: { id }, data: { password }, select: { id: true } })
    },
}
