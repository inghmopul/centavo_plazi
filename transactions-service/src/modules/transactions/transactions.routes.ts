import { Router } from 'express';
import { TransactionsController } from './transactions.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

export function createTransactionsRoutes(controller: TransactionsController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/summary', controller.summary);
  router.get('/', controller.list);
  router.post('/', controller.create);

  return router;
}
