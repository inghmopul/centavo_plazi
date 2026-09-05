import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

/**
 * MÓDULO CENTRAL DE VALIDACIÓN DE SESIÓN
 * REGLA AGENTS.md: "Toda validación de sesión debe pasar por un solo módulo central."
 * 
 * Este módulo es el único punto de entrada autorizado para validar,
 * verificar firma y decodificar tokens de sesión en todo el microservicio.
 */

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

export interface SessionTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  name?: string;
}

export interface SessionValidationSuccess {
  isValid: true;
  user: SessionUser;
  payload: SessionTokenPayload;
}

export interface SessionValidationFailure {
  isValid: false;
  error: string;
  code: 'TOKEN_MISSING' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'SESSION_ERROR';
}

export type SessionValidationResult = SessionValidationSuccess | SessionValidationFailure;

export class SessionValidator {
  /**
   * Valida un token JWT de sesión.
   * REGLA AGENTS.md: Nunca loguear el token en texto plano.
   */
  public static validateToken(token: string | undefined | null): SessionValidationResult {
    if (!token || typeof token !== 'string') {
      logger.warn('Validación de sesión fallida: token no proporcionado');
      return {
        isValid: false,
        error: 'Token de sesión no proporcionado',
        code: 'TOKEN_MISSING'
      };
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as SessionTokenPayload;

      if (!decoded || !decoded.sub || !decoded.email) {
        logger.warn('Validación de sesión fallida: estructura de payload inválida');
        return {
          isValid: false,
          error: 'Payload de sesión inválido',
          code: 'TOKEN_INVALID'
        };
      }

      logger.debug('Sesión validada exitosamente para usuario', { userId: decoded.sub });

      return {
        isValid: true,
        user: {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name
        },
        payload: decoded
      };
    } catch (err: unknown) {
      const errorName = (err && typeof err === 'object' && 'name' in err) ? (err as { name: string }).name : '';

      if (err instanceof jwt.TokenExpiredError || errorName === 'TokenExpiredError') {
        logger.warn('Validación de sesión fallida: token expirado');
        return {
          isValid: false,
          error: 'La sesión ha expirado',
          code: 'TOKEN_EXPIRED'
        };
      }

      if (
        err instanceof jwt.JsonWebTokenError ||
        errorName === 'JsonWebTokenError' ||
        errorName === 'NotBeforeError' ||
        err instanceof SyntaxError ||
        errorName === 'SyntaxError'
      ) {
        logger.warn('Validación de sesión fallida: firma o token inválido');
        return {
          isValid: false,
          error: 'Token de sesión inválido',
          code: 'TOKEN_INVALID'
        };
      }

      logger.error('Error inesperado durante la validación de sesión');
      return {
        isValid: false,
        error: 'Error en la verificación de sesión',
        code: 'SESSION_ERROR'
      };
    }
  }

  /**
   * Extrae el Bearer token desde el encabezado Authorization.
   */
  public static extractTokenFromHeader(authHeader: string | undefined | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7).trim();
  }
}
