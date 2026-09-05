import express, { Express } from 'express';
import cors from 'cors';
import { IUserRepository } from './repositories/userRepository.interface.js';
import { InMemoryUserRepository } from './repositories/inMemoryUserRepository.js';
import { AuthService } from './modules/auth/auth.service.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { createAuthRoutes } from './modules/auth/auth.routes.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';

export interface AppOptions {
  userRepository?: IUserRepository;
}

export function createApp(options: AppOptions = {}): {
  app: Express;
  authService: AuthService;
  userRepository: IUserRepository;
} {
  const app = express();

  // Dependencias e inyección
  const userRepository = options.userRepository || new InMemoryUserRepository();
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  // Middlewares globales
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // Rutas de salud
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'auth-service' });
  });

  // Rutas de autenticación
  app.use('/api/auth', createAuthRoutes(authController));

  // Manejo centralizado de errores
  app.use(errorHandler);

  return { app, authService, userRepository };
}
