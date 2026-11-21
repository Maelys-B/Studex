import type { Request, Response, NextFunction } from 'express'
import { userRepository } from '../repositories/user.repository.js'

const verifyAdmin = async (_req: Request, res: Response, next: NextFunction) => {
    const user = await userRepository.findRole(res.locals.userId)

    if (user?.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' })
    }
    next()
}

export default verifyAdmin
