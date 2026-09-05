import { Response } from 'express';
import { NotificationsService } from './notifications.service.js';
import { transactionEventSchema } from './notifications.schemas.js';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware.js';

export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Endpoint receptor de eventos de nueva transacción.
   * Evalúa contra el presupuesto y determina si se genera alerta de sobregasto.
   * POST /api/notifications/events/transaction
   */
  processTransactionEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const validation = transactionEventSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          message: 'Error de validación del evento de transacción',
          errors: validation.error.format()
        });
        return;
      }

      const userId = req.user?.id || 'usr_demo123';
      const token = req.headers.authorization?.replace('Bearer ', '');

      const result = await this.notificationsService.processTransactionEvent(
        userId,
        validation.data,
        token
      );

      // Si se generó una alerta, respondemos con código 201 (recurso de alerta creado)
      // Si no generó alerta pero fue procesado exitosamente, respondemos 200 con la evaluación
      const statusCode = result.alertGenerated ? 201 : 200;
      res.status(statusCode).json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al procesar el evento de transacción';
      res.status(500).json({ message });
    }
  };

  /**
   * Listar todas las notificaciones/alertas del usuario
   * GET /api/notifications
   */
  list = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id || 'usr_demo123';
      const notifications = await this.notificationsService.getNotifications(userId);
      res.status(200).json(notifications);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al obtener notificaciones';
      res.status(500).json({ message });
    }
  };

  /**
   * Obtener una notificación por ID
   * GET /api/notifications/:id
   */
  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const notification = await this.notificationsService.getNotificationById(id);

      if (!notification) {
        res.status(404).json({ message: 'Notificación no encontrada' });
        return;
      }

      res.status(200).json(notification);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al consultar notificación';
      res.status(500).json({ message });
    }
  };

  /**
   * Marcar notificación como leída
   * PATCH /api/notifications/:id/read
   */
  markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'usr_demo123';
      const updated = await this.notificationsService.markAsRead(id, userId);

      if (!updated) {
        res.status(404).json({ message: 'Notificación no encontrada o no autorizada' });
        return;
      }

      res.status(200).json({ message: 'Notificación marcada como leída' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar notificación';
      res.status(500).json({ message });
    }
  };
}
