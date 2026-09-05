import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Manejo de errores de validación de Zod
  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message
    }));

    logger.warn('Error de validación de entrada', { issues });
    res.status(400).json({
      success: false,
      error: 'Error de validación de datos',
      details: issues
    });
    return;
  }

  // Errores conocidos de negocio
  if (
    err.message === 'Credenciales inválidas' ||
    err.message === 'El correo electrónico ya se encuentra registrado'
  ) {
    const statusCode = err.message === 'Credenciales inválidas' ? 401 : 409;
    res.status(statusCode).json({
      success: false,
      error: err.message
    });
    return;
  }

  // Error 500 no controlado
  logger.error(`Error no controlado en el servidor: ${err.message}`);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
}
