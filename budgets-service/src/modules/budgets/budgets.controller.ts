import { Response } from 'express';
import { BudgetsService } from './budgets.service.js';
import { createBudgetSchema, queryBudgetsSchema } from './budgets.schemas.js';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware.js';
import { BudgetPeriod } from '../../types/budget.types.js';

export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const validation = createBudgetSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          message: 'Error de validación',
          errors: validation.error.format()
        });
        return;
      }

      const userId = req.user?.id || 'usr_demo123';
      const budget = await this.budgetsService.create(userId, validation.data);

      res.status(201).json(budget);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar el presupuesto';
      res.status(500).json({ message });
    }
  };

  list = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id || 'usr_demo123';
      const queryValidation = queryBudgetsSchema.safeParse(req.query);

      const filters: { category?: string; period?: BudgetPeriod } = {};
      if (queryValidation.success && queryValidation.data.category) {
        filters.category = queryValidation.data.category;
      }
      if (queryValidation.success && queryValidation.data.period) {
        filters.period = queryValidation.data.period.toUpperCase() as BudgetPeriod;
      }

      const budgets = await this.budgetsService.getBudgets(userId, filters);
      res.status(200).json(budgets);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al consultar los presupuestos';
      res.status(500).json({ message });
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const budget = await this.budgetsService.getBudgetById(id);

      if (!budget) {
        res.status(404).json({ message: 'Presupuesto no encontrado' });
        return;
      }

      res.status(200).json(budget);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al obtener el presupuesto';
      res.status(500).json({ message });
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'usr_demo123';
      const deleted = await this.budgetsService.deleteBudget(id, userId);

      if (!deleted) {
        res.status(404).json({ message: 'Presupuesto no encontrado o no autorizado' });
        return;
      }

      res.status(200).json({ message: 'Presupuesto eliminado con éxito' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el presupuesto';
      res.status(500).json({ message });
    }
  };
}
