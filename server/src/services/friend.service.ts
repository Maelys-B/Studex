import { HttpError } from '../errors/HttpError.js'
import { isUniqueViolation } from '../lib/prisma.js'
import { friendshipRepository } from '../repositories/friendship.repository.js'
import { userRepository } from '../repositories/user.repository.js'

type Relation = 'none' | 'sent' | 'received' | 'friends'

const SEARCH_LIMIT = 10

export const friendService = {
    async search(userId: number, query: string) {
        const users = await userRepository.searchByUsernamePrefix(query, userId, SEARCH_LIMIT)
        const links = await friendshipRepository.findBetween(userId, users.map(u => u.id))

        return users.map(user => {
            const link = links.find(l => l.requester_id === user.id || l.addressee_id === user.id)
            let relation: Relation = 'none'
            if (link?.status === 'accepted') relation = 'friends'
            else if (link?.status === 'pending') relation = link.requester_id === userId ? 'sent' : 'received'
            return { id: user.id, username: user.username, relation }
        })
    },

    async sendRequest(userId: number, targetId: number) {
        if (targetId === userId) throw new HttpError(400, 'Tu ne peux pas t\'ajouter toi-même')
        if (!(await userRepository.findUsername(targetId))) throw new HttpError(404, 'Joueur introuvable')

        try {
            await friendshipRepository.createRequest(userId, targetId)
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw new HttpError(409, 'Une demande ou une amitié existe déjà avec ce joueur')
            }
            throw err
        }
    },

    async listReceivedRequests(userId: number) {
        const requests = await friendshipRepository.findPendingReceived(userId)
        return requests.map(r => ({ id: r.id, userId: r.requester.id, username: r.requester.username }))
    },

    listFriends(userId: number) {
        return userRepository.findFriends(userId)
    },

    async answerRequest(userId: number, requestId: number, status: 'accepted' | 'rejected') {
        const { count } = status === 'accepted'
            ? await friendshipRepository.acceptRequest(requestId, userId)
            : await friendshipRepository.deleteRequest(requestId, userId)

        if (count === 0) throw new HttpError(404, 'Demande introuvable')
    },

    async removeFriend(userId: number, otherId: number) {
        const { count } = await friendshipRepository.deleteFriendship(userId, otherId)
        if (count === 0) throw new HttpError(404, 'Ami introuvable')
    },
}
