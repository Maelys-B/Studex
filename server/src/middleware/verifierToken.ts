import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET manquant dans le .env')
}

const verifierToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erreur: 'Non authentifié' });
  }

  try {
    const decode = jwt.verify(token, JWT_SECRET) as { userId: number }
    res.locals.userId = decode.userId;
    next();
  } catch {
    return res.status(401).json({ erreur: 'Veuillez vous reconnecter' });
  }
}

export default verifierToken