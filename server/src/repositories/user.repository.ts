import { prisma, type Db } from '../lib/prisma.js'

const publicFields = { id: true, username: true, email: true, role: true, coins: true } as const

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

    findUsername(id: number) {
        return prisma.user.findUnique({ where: { id }, select: { id: true, username: true } })
    },

    searchByUsernamePrefix(prefix: string, exceptUserId: number, limit: number) {
        return prisma.user.findMany({
            where: { username: { startsWith: prefix.replace(/[\\%_]/g, '\\$&') }, id: { not: exceptUserId } },
            select: { id: true, username: true },
            orderBy: { username: 'asc' },
            take: limit,
        })
    },

    findFriends(userId: number) {
        return prisma.user.findMany({
            where: {
                OR: [
                    { sentFriendRequests: { some: { addressee_id: userId, status: 'accepted' } } },
                    { receivedFriendRequests: { some: { requester_id: userId, status: 'accepted' } } },
                ],
            },
            select: { id: true, username: true },
            orderBy: { username: 'asc' },
        })
    },

    findAdminEmails() {
        return prisma.user.findMany({ where: { role: 'admin' }, select: { email: true } })
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

    findCoins(db: Db, id: number) {
        return db.user.findUnique({ where: { id }, select: { coins: true } })
    },

    addCoins(db: Db, id: number, amount: number) {
        return db.user.update({ where: { id }, data: { coins: { increment: amount } }, select: { coins: true } })
    },

    removeCoins(db: Db, id: number, amount: number) {
        return db.user.updateMany({ where: { id, coins: { gte: amount } }, data: { coins: { decrement: amount } } })
    },
}
