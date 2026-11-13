import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET missing from .env')
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    res.locals.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Veuillez vous reconnecter' });
  }
}

export default verifyToken