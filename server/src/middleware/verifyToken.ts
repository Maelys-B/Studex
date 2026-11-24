import type { Request, Response, NextFunction } from 'express'
import { readToken } from '../lib/token.js'

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const userId = readToken(token)
  if (userId === null) {
    return res.status(401).json({ error: 'Veuillez vous reconnecter' });
  }

  res.locals.userId = userId;
  next();
}

export default verifyToken