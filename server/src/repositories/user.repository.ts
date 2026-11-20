import { prisma } from '../lib/prisma.js'

export const userRepository = {
    findRole(id: number) {
        return prisma.user.findUnique({ where: { id }, select: { role: true } })
    },
}
