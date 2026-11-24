import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET missing')
}

export function readToken(token: string): number | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as { userId: number }
        return decoded.userId
    } catch {
        return null
    }
}