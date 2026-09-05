import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Middleware para registrar peticiones HTTP.
 * REGLA AGENTS.md: Nunca loguear credenciales ni tokens en texto plano.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Se registran únicamente metadatos seguros de la petición, nunca headers con token ni cuerpo con contraseña
    logger.info(`HTTP ${method} ${originalUrl} -> ${statusCode} (${duration}ms)`);
  });

  next();
}
