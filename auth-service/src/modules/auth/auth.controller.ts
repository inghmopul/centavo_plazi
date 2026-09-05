import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { registerSchema, loginSchema } from './auth.schemas.js';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware.js';
import { SessionValidator } from '../session/sessionValidator.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await this.authService.register(validatedData);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.authService.login(validatedData);

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Endpoint de verificación de sesión.
   * REGLA AGENTS.md: Pasa por el módulo central SessionValidator.
   */
  verify = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = SessionValidator.extractTokenFromHeader(authHeader);

    const validation = this.authService.verifySession(token);

    if (!validation.isValid) {
      res.status(401).json({
        success: false,
        valid: false,
        error: validation.error,
        code: validation.code
      });
      return;
    }

    res.status(200).json({
      success: true,
      valid: true,
      data: {
        user: validation.user
      }
    });
  };

  /**
   * Endpoint para obtener los datos del usuario de la sesión activa
   */
  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'No autenticado'
        });
        return;
      }

      const userProfile = await this.authService.getUserProfile(req.user.id);
      if (!userProfile) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: userProfile
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
