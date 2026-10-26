import type { PoolConnection, RowDataPacket } from 'mysql2/promise'
import { db } from '../db.js'
import type { BoosterState, Card } from '../types.js'
import { MAX_BOOSTERS } from './boosterLogic.js'

export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
    const conn = await db.getConnection()
    try {
        await conn.beginTransaction()
        const result = await fn(conn)
        await conn.commit()
        return result
    } catch (error) {
        await conn.rollback()
        throw error
    } finally {
        conn.release()
    }
}

export async function getState(conn: PoolConnection, userId: number): Promise<BoosterState> {
    await conn.query(
        'INSERT IGNORE INTO user_boosters (user_id, stored_booster, last_gained_at) VALUES (?, ?, ?)',
        [userId, MAX_BOOSTERS, Date.now()]
    )
    const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT stored_booster, last_gained_at FROM user_boosters WHERE user_id = ? FOR UPDATE',
        [userId]
    )
    return { stored: rows[0].stored_booster, lastGainedAt: Number(rows[0].last_gained_at) }
}

export async function saveState(conn: PoolConnection, userId: number, state: BoosterState): Promise<void> {
    await conn.query(
        'UPDATE user_boosters SET stored_booster = ?, last_gained_at = ? WHERE user_id = ?',
        [state.stored, state.lastGainedAt, userId]
    )
}

export async function loadPool(conn: PoolConnection): Promise<Card[]> {
    const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT id, name, subtitle, description, image, color, rarity, type FROM cards'
    )
    return rows.map(row => ({
        id: row.id,
        name: row.name,
        subtitle: row.subtitle ?? undefined,
        description: row.description ?? undefined,
        image: row.image ?? undefined,
        color: row.color ?? undefined,
        rarity: row.rarity,
        type: row.type
    }))
}
