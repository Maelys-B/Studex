import { prisma, type Db } from '../lib/prisma.js'
import type { Prisma } from '../generated/prisma/client.js'

export type StudentCardData = {
    name: string,
    subtitle: string,
    color: string,
    avatar: Prisma.InputJsonObject,
}

const orderedAttacks = { orderBy: { slot: 'asc' } } satisfies Prisma.Card$attacksArgs

export const cardRepository = {
    findApproved() {
        return prisma.card.findMany({
            where: { status: 'approved' },
            select: { id: true, name: true, position_collection: true, subtitle: true, image: true, color: true, rarity: true, type: true },
            orderBy: { id: 'asc' },
        })
    },

    findShowcase() {
        return prisma.card.findMany({
            where: { status: 'approved', type: { in: ['collection', 'battle'] } },
            select: {
                id: true, name: true, position_collection: true, subtitle: true, description: true,
                image: true, hp: true, rarity: true, type: true,
                attacks: orderedAttacks,
            },
            orderBy: { id: 'asc' },
        })
    },

    findApprovedWithAttacks(db: Db) {
        return db.card.findMany({ where: { status: 'approved' }, include: { attacks: orderedAttacks } })
    },

    findByCreator(userId: number) {
        return prisma.card.findUnique({
            where: { created_by: userId },
            select: { id: true, name: true, subtitle: true, color: true, avatar: true, rarity: true, type: true, status: true },
        })
    },

    findStatusByCreator(userId: number) {
        return prisma.card.findUnique({ where: { created_by: userId }, select: { status: true } })
    },

    findWithCreator(id: number) {
        return prisma.card.findUnique({
            where: { id },
            select: { id: true, name: true, created_by: true, creator: { select: { username: true } } },
        })
    },

    createStudentCard(userId: number, data: StudentCardData) {
        return prisma.card.create({
            data: { ...data, rarity: 'common', type: 'student', created_by: userId, status: 'pending', position_collection: 0 },
        })
    },

    updateStudentCard(userId: number, data: StudentCardData) {
        return prisma.card.updateMany({ where: { created_by: userId }, data: { ...data, status: 'pending' } })
    },

    findPending() {
        return prisma.card.findMany({
            where: { status: 'pending', created_by: { not: null } },
            select: { id: true, name: true, subtitle: true, color: true, avatar: true, creator: { select: { username: true } } },
            orderBy: { id: 'asc' },
        })
    },

    updatePlayerCardStatus(id: number, status: 'approved' | 'rejected') {
        return prisma.card.updateMany({ where: { id, created_by: { not: null } }, data: { status } })
    },
}
