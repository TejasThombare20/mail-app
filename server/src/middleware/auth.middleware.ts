import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
  
      if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };     
  
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };