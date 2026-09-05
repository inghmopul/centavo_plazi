import express, { Express } from 'express';
import cors from 'cors';
import { IBudgetRepository } from './repositories/budgetRepository.interface.js';
import { InMemoryBudgetRepository } from './repositories/inMemoryBudgetRepository.js';
import { BudgetsService } from './modules/budgets/budgets.service.js';
import { BudgetsController } from './modules/budgets/budgets.controller.js';
import { createBudgetsRoutes } from './modules/budgets/budgets.routes.js';

export interface AppOptions {
  budgetRepository?: IBudgetRepository;
}

export function createApp(options: AppOptions = {}): {
  app: Express;
  budgetsService: BudgetsService;
  budgetRepository: IBudgetRepository;
} {
  const app = express();

  const budgetRepository = options.budgetRepository || new InMemoryBudgetRepository();
  const budgetsService = new BudgetsService(budgetRepository);
  const budgetsController = new BudgetsController(budgetsService);

  app.use(cors());
  app.use(express.json());

  // Request logger simple
  app.use((req, _res, next) => {
    console.log(`[budgets-service] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'budgets-service' });
  });

  // Rutas con prefijo /api/budgets y fallback /budgets
  const routes = createBudgetsRoutes(budgetsController);
  app.use('/api/budgets', routes);
  app.use('/budgets', routes);

  return { app, budgetsService, budgetRepository };
}
