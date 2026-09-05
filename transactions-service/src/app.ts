import express, { Express } from 'express';
import cors from 'cors';
import { ITransactionRepository } from './repositories/transactionRepository.interface.js';
import { InMemoryTransactionRepository } from './repositories/inMemoryTransactionRepository.js';
import { TransactionsService } from './modules/transactions/transactions.service.js';
import { TransactionsController } from './modules/transactions/transactions.controller.js';
import { createTransactionsRoutes } from './modules/transactions/transactions.routes.js';

export interface AppOptions {
  transactionRepository?: ITransactionRepository;
}

export function createApp(options: AppOptions = {}): {
  app: Express;
  transactionsService: TransactionsService;
  transactionRepository: ITransactionRepository;
} {
  const app = express();

  const transactionRepository = options.transactionRepository || new InMemoryTransactionRepository();
  const transactionsService = new TransactionsService(transactionRepository);
  const transactionsController = new TransactionsController(transactionsService);

  app.use(cors());
  app.use(express.json());

  // Request logger simple
  app.use((req, _res, next) => {
    console.log(`[transactions-service] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'transactions-service' });
  });

  // Rutas con prefijo /api/transactions y fallback /transactions
  const routes = createTransactionsRoutes(transactionsController);
  app.use('/api/transactions', routes);
  app.use('/transactions', routes);

  return { app, transactionsService, transactionRepository };
}
