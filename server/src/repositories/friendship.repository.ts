import { prisma } from '../lib/prisma.js'

export function pair(a: number, b: number) {
    return { user_low: Math.min(a, b), user_high: Math.max(a, b) }
}

export const friendshipRepository = {
    findBetween(userId: number, otherIds: number[]) {
        if (otherIds.length === 0) return Promise.resolve([])
        return prisma.friendship.findMany({
            where: { OR: otherIds.map(otherId => pair(userId, otherId)) },
            select: { requester_id: true, addressee_id: true, status: true },
        })
    },

    createRequest(requesterId: number, addresseeId: number) {
        return prisma.friendship.create({
            data: { requester_id: requesterId, addressee_id: addresseeId, ...pair(requesterId, addresseeId) },
        })
    },

    findPendingReceived(userId: number) {
        return prisma.friendship.findMany({
            where: { addressee_id: userId, status: 'pending' },
            select: { id: true, requester: { select: { id: true, username: true } } },
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        })
    },

    acceptRequest(requestId: number, addresseeId: number) {
        return prisma.friendship.updateMany({
            where: { id: requestId, addressee_id: addresseeId, status: 'pending' },
            data: { status: 'accepted' },
        })
    },

    deleteRequest(requestId: number, addresseeId: number) {
        return prisma.friendship.deleteMany({ where: { id: requestId, addressee_id: addresseeId, status: 'pending' } })
    },

    deleteFriendship(userId: number, otherId: number) {
        return prisma.friendship.deleteMany({ where: { ...pair(userId, otherId), status: 'accepted' } })
    },
}
