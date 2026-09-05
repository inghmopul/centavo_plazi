import { ITransactionRepository } from '../../repositories/transactionRepository.interface.js';
import { Transaction, TransactionSummary } from '../../types/transaction.types.js';
import { CreateTransactionInput } from './transactions.schemas.js';

export class TransactionsService {
  constructor(private transactionRepository: ITransactionRepository) {}

  async create(userId: string, input: CreateTransactionInput): Promise<Transaction> {
    return this.transactionRepository.create({
      userId,
      title: input.title,
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: input.date,
      notes: input.notes
    });
  }

  async getTransactions(userId: string, filterType?: 'ALL' | 'INCOME' | 'EXPENSE'): Promise<Transaction[]> {
    return this.transactionRepository.findAllByUserId(userId, filterType);
  }

  async getSummary(userId: string): Promise<TransactionSummary> {
    return this.transactionRepository.getSummaryByUserId(userId);
  }
}
