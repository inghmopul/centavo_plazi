import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

export function createNotificationsRoutes(controller: NotificationsController): Router {
  const router = Router();

  router.use(authMiddleware);

  // Endpoint para procesar eventos de transacciones (evaluación y alerta)
  router.post('/events/transaction', controller.processTransactionEvent);

  // Endpoints CRUD/consulta de notificaciones
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.patch('/:id/read', controller.markAsRead);

  return router;
}
