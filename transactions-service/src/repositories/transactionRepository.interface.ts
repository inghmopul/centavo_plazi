import { Transaction, CreateTransactionData, TransactionSummary } from '../types/transaction.types.js';

export interface ITransactionRepository {
  create(data: CreateTransactionData): Promise<Transaction>;
  findAllByUserId(userId: string, filterType?: 'ALL' | 'INCOME' | 'EXPENSE'): Promise<Transaction[]>;
  getSummaryByUserId(userId: string): Promise<TransactionSummary>;
  findById(id: string): Promise<Transaction | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
