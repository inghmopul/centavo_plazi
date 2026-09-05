import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  // Rutas públicas
  router.post('/register', authController.register);
  router.post('/login', authController.login);

  // Verificación de sesión centralizada
  router.get('/verify', authController.verify);

  // Ruta protegida de perfil
  router.get('/me', authMiddleware, authController.me);

  return router;
}
