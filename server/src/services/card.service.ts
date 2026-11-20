import type { Card as CardRow, CardAttack } from '../generated/prisma/client.js'
import { HttpError } from '../errors/HttpError.js'
import { isUniqueViolation } from '../lib/prisma.js'
import { cardRepository, type StudentCardData } from '../repositories/card.repository.js'
import type { Attack, Avatar, Card } from '../types.js'
import type { StudentCardInput } from './studentCardValidation.js'

export function toAttack(attack: Pick<CardAttack, 'name' | 'energy_cost' | 'damage' | 'description'>): Attack {
    return { name: attack.name, cost: attack.energy_cost, damage: attack.damage, description: attack.description }
}

export function toCard(card: CardRow & { attacks: CardAttack[] }): Card {
    return {
        id: card.id,
        name: card.name,
        position_collection: card.position_collection,
        subtitle: card.subtitle ?? undefined,
        description: card.description ?? undefined,
        image: card.image ?? undefined,
        hp: card.hp ?? undefined,
        attacks: card.attacks.length > 0 ? card.attacks.map(toAttack) : undefined,
        color: card.color ?? undefined,
        avatar: (card.avatar as Avatar | null) ?? undefined,
        rarity: card.rarity,
        type: card.type,
    }
}

function toStudentCardData(input: StudentCardInput): StudentCardData {
    return {
        name: `${input.first_name}.${input.last_name}`,
        subtitle: input.subtitle,
        color: input.color,
        avatar: input.avatar,
    }
}

export const cardService = {
    listApproved() {
        return cardRepository.findApproved()
    },

    async showcase() {
        const cards = await cardRepository.findShowcase()
        return cards.map(({ attacks, ...card }) =>
            card.type === 'battle' ? { ...card, attacks: attacks.map(toAttack) } : card
        )
    },

    async getMine(userId: number) {
        const card = await cardRepository.findByCreator(userId)
        if (!card) throw new HttpError(404, 'Aucune carte')
        return card
    },

    async createMine(userId: number, input: StudentCardInput) {
        try {
            await cardRepository.createStudentCard(userId, toStudentCardData(input))
        } catch (err) {
            if (isUniqueViolation(err)) throw new HttpError(409, 'Tu as déjà créé ta carte')
            throw err
        }
    },

    async updateMine(userId: number, input: StudentCardInput) {
        const { count } = await cardRepository.updateStudentCard(userId, toStudentCardData(input))
        if (count === 0) throw new HttpError(404, 'Aucune carte à modifier')
    },
}
