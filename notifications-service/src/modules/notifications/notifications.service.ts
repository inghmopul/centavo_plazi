import { INotificationRepository } from '../../repositories/notificationRepository.interface.js';
import { IBudgetsClient } from '../../clients/budgetsClient.js';
import {
  Notification,
  AlertEvaluationResult,
  NotificationType
} from '../../types/notification.types.js';
import { TransactionEventInput } from './notifications.schemas.js';

export class NotificationsService {
  constructor(
    private notificationRepository: INotificationRepository,
    private budgetsClient?: IBudgetsClient
  ) {}

  /**
   * Evalúa una nueva transacción contra el presupuesto correspondiente
   * y genera una alerta si sobrepasa el límite o alcanza un umbral crítico.
   */
  async processTransactionEvent(
    userId: string,
    event: TransactionEventInput,
    token?: string
  ): Promise<AlertEvaluationResult> {
    // Si la transacción es un ingreso, no genera alerta de sobregasto
    if (event.type === 'INCOME') {
      return {
        alertGenerated: false,
        reason: 'Los ingresos no generan alertas de sobregasto'
      };
    }

    const effectiveUserId = event.userId || userId;
    const category = event.category.trim();

    // 1. Obtener información del presupuesto asignado a la categoría
    let limitAmount = event.budgetLimit;
    if (limitAmount === undefined && this.budgetsClient) {
      const budget = await this.budgetsClient.getBudgetByCategory(effectiveUserId, category, token);
      if (budget) {
        limitAmount = budget.limitAmount;
      }
    }

    // Si no existe presupuesto configurado para esta categoría, no se puede evaluar sobregasto
    if (limitAmount === undefined || limitAmount === null) {
      return {
        alertGenerated: false,
        reason: `No existe un presupuesto configurado para la categoría '${category}'`
      };
    }

    // 2. Calcular gasto acumulado en la categoría
    let previousSpent = event.currentSpent;
    if (previousSpent === undefined) {
      if (this.budgetsClient) {
        previousSpent = await this.budgetsClient.calculateSpentByCategory(effectiveUserId, category, token);
      } else {
        previousSpent = 0;
      }
    }

    const totalSpent = Number((previousSpent + event.amount).toFixed(2));
    const percentageUsed = Number(((totalSpent / limitAmount) * 100).toFixed(2));
    const isOverBudget = totalSpent > limitAmount;
    const excessAmount = isOverBudget ? Number((totalSpent - limitAmount).toFixed(2)) : 0;

    const budgetComparison = {
      category,
      limitAmount,
      totalSpent,
      percentageUsed,
      isOverBudget,
      excessAmount
    };

    // 3. Determinar si se genera alerta:
    // Alerta de sobregasto cuando totalSpent > limitAmount (100%+)
    // Alerta de advertencia cuando alcanza el 80% o más
    let alertType: NotificationType | null = null;
    let title = '';
    let message = '';

    if (isOverBudget) {
      alertType = 'BUDGET_EXCEEDED';
      title = `¡Alerta de sobregasto en ${category}!`;
      message = `Has superado tu presupuesto en la categoría '${category}'. Límite: $${limitAmount}, Total gastado: $${totalSpent} (Exceso: $${excessAmount}, ${percentageUsed}% del presupuesto).`;
    } else if (percentageUsed >= 80) {
      alertType = 'BUDGET_WARNING';
      title = `Atención: Presupuesto de ${category} próximo al límite`;
      message = `Has alcanzado el ${percentageUsed}% de tu presupuesto en '${category}'. Gastado: $${totalSpent} de un total de $${limitAmount}.`;
    }

    if (!alertType) {
      return {
        alertGenerated: false,
        reason: `El gasto acumulado (${percentageUsed}%) no supera el umbral de alerta`,
        budgetComparison
      };
    }

    // 4. Guardar notificación de alerta en el repositorio
    const notification = await this.notificationRepository.create({
      userId: effectiveUserId,
      type: alertType,
      title,
      message,
      category,
      channel: 'IN_APP',
      metadata: {
        transactionId: event.transactionId,
        transactionAmount: event.amount,
        budgetLimit: limitAmount,
        currentSpent: totalSpent,
        percentageUsed,
        excessAmount
      }
    });

    return {
      alertGenerated: true,
      notification,
      budgetComparison
    };
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findAllByUserId(userId);
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    return this.notificationRepository.findById(id);
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    return this.notificationRepository.markAsRead(id, userId);
  }
}
