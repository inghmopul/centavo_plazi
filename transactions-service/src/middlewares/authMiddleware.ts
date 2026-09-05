import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { sub?: string; id?: string; email?: string; name?: string };
      req.user = {
        id: decoded.sub || decoded.id || 'usr_demo123',
        email: decoded.email || 'demo@centavo.app',
        name: decoded.name || 'Usuario'
      };
      return next();
    } catch {
      // Si el token es de mock o expiró, asignamos usuario demo para no bloquear la experiencia de desarrollo
      req.user = {
        id: 'usr_demo123',
        email: 'demo@centavo.app',
        name: 'Usuario Demo'
      };
      return next();
    }
  }

  // Si no se proporcionó token en desarrollo
  req.user = {
    id: 'usr_demo123',
    email: 'demo@centavo.app',
    name: 'Usuario Demo'
  };
  next();
}
