import { HttpError } from '../errors/HttpError.js'
import { cardRepository } from '../repositories/card.repository.js'

export const adminService = {
    async listPendingCards() {
        const cards = await cardRepository.findPending()
        return cards.map(({ creator, ...card }) => ({ ...card, author: creator?.username }))
    },

    async setCardStatus(cardId: number, status: 'approved' | 'rejected') {
        const { count } = await cardRepository.updatePlayerCardStatus(cardId, status)
        if (count === 0) throw new HttpError(404, 'Carte introuvable')
    },
}
