import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nestly-super-secret-key-for-dev';

export interface LabourAuthRequest extends Request {
  labour?: { id: string; role: string };
}

export const labourAuthMiddleware = (
  req: LabourAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (decoded.role !== 'labour') {
      res.status(403).json({ error: 'Forbidden: Not a labour account.' });
      return;
    }
    req.labour = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid token.' });
  }
};
