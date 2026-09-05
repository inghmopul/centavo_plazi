import { Response } from 'express';
import { TransactionsService } from './transactions.service.js';
import { createTransactionSchema } from './transactions.schemas.js';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware.js';

export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const validation = createTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          message: 'Error de validación',
          errors: validation.error.format()
        });
        return;
      }

      const userId = req.user?.id || 'usr_demo123';
      const transaction = await this.transactionsService.create(userId, validation.data);

      res.status(201).json(transaction);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar la transacción';
      res.status(500).json({ message });
    }
  };

  list = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id || 'usr_demo123';
      const filterType = req.query.type as 'ALL' | 'INCOME' | 'EXPENSE' | undefined;
      const transactions = await this.transactionsService.getTransactions(userId, filterType);

      res.status(200).json(transactions);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al obtener las transacciones';
      res.status(500).json({ message });
    }
  };

  summary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id || 'usr_demo123';
      const summary = await this.transactionsService.getSummary(userId);

      res.status(200).json(summary);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al obtener el resumen de transacciones';
      res.status(500).json({ message });
    }
  };
}
