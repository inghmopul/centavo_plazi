import { Request, Response, NextFunction } from 'express';
import { SessionValidator, SessionUser } from '../modules/session/sessionValidator.js';

export interface AuthenticatedRequest extends Request {
  user?: SessionUser;
}

/**
 * Middleware de autenticación HTTP.
 * REGLA AGENTS.md: "Toda validación de sesión debe pasar por un solo módulo central."
 * Delega la validación exclusivamente a SessionValidator.
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = SessionValidator.extractTokenFromHeader(authHeader);

  const validation = SessionValidator.validateToken(token);

  if (!validation.isValid) {
    res.status(401).json({
      success: false,
      error: validation.error,
      code: validation.code
    });
    return;
  }

  req.user = validation.user;
  next();
}
