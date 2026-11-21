import { prisma, type Db } from '../lib/prisma.js'
import type { BoosterState } from '../types.js'

export const boosterRepository = {
    ensureState(userId: number, initial: BoosterState) {
        return prisma.userBooster.createMany({
            data: [{ user_id: userId, stored_booster: initial.stored, last_gained_at: BigInt(initial.lastGainedAt) }],
            skipDuplicates: true,
        })
    },

    async lockState(tx: Db, userId: number): Promise<BoosterState> {
        const [row] = await tx.$queryRaw<{ stored_booster: number, last_gained_at: bigint }[]>`
            SELECT stored_booster, last_gained_at FROM user_boosters WHERE user_id = ${userId} FOR UPDATE`
        return { stored: Number(row.stored_booster), lastGainedAt: Number(row.last_gained_at) }
    },

    saveState(tx: Db, userId: number, state: BoosterState) {
        return tx.userBooster.update({
            where: { user_id: userId },
            data: { stored_booster: state.stored, last_gained_at: BigInt(state.lastGainedAt) },
        })
    },

    async addCards(tx: Db, userId: number, cardIds: number[]) {
        for (const cardId of cardIds) {
            await tx.userCard.upsert({
                where: { user_id_card_id: { user_id: userId, card_id: cardId } },
                create: { user_id: userId, card_id: cardId },
                update: { quantity: { increment: 1 } },
            })
        }
    },
}
