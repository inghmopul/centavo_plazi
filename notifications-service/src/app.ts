import express, { Express } from 'express';
import cors from 'cors';
import { INotificationRepository } from './repositories/notificationRepository.interface.js';
import { InMemoryNotificationRepository } from './repositories/inMemoryNotificationRepository.js';
import { IBudgetsClient, HttpBudgetsClient } from './clients/budgetsClient.js';
import { NotificationsService } from './modules/notifications/notifications.service.js';
import { NotificationsController } from './modules/notifications/notifications.controller.js';
import { createNotificationsRoutes } from './modules/notifications/notifications.routes.js';
import { config } from './config/env.js';

export interface AppOptions {
  notificationRepository?: INotificationRepository;
  budgetsClient?: IBudgetsClient;
}

export function createApp(options: AppOptions = {}): {
  app: Express;
  notificationsService: NotificationsService;
  notificationRepository: INotificationRepository;
} {
  const app = express();

  const notificationRepository = options.notificationRepository || new InMemoryNotificationRepository();
  const budgetsClient =
    options.budgetsClient ||
    new HttpBudgetsClient(config.budgetsServiceUrl, config.transactionsServiceUrl);

  const notificationsService = new NotificationsService(notificationRepository, budgetsClient);
  const notificationsController = new NotificationsController(notificationsService);

  app.use(cors());
  app.use(express.json());

  // Request logger simple siguiendo la convención de los otros servicios
  app.use((req, _res, next) => {
    console.log(`[notifications-service] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'notifications-service' });
  });

  // Rutas con prefijo /api/notifications y fallback /notifications
  const routes = createNotificationsRoutes(notificationsController);
  app.use('/api/notifications', routes);
  app.use('/notifications', routes);

  return { app, notificationsService, notificationRepository };
}
