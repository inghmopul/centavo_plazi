import { Router } from 'express';
import { BudgetsController } from './budgets.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

export function createBudgetsRoutes(controller: BudgetsController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.getById);
  router.delete('/:id', controller.delete);

  return router;
}
