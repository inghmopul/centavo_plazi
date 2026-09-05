import { ITransactionRepository } from './transactionRepository.interface.js';
import { Transaction, CreateTransactionData, TransactionSummary } from '../types/transaction.types.js';

export class InMemoryTransactionRepository implements ITransactionRepository {
  private transactions: Map<string, Transaction> = new Map();

  async create(data: CreateTransactionData): Promise<Transaction> {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const transaction: Transaction = {
      id,
      userId: data.userId,
      title: data.title.trim(),
      amount: Number(data.amount),
      type: data.type,
      category: data.category.trim(),
      date: data.date || now.toISOString().split('T')[0],
      notes: data.notes?.trim(),
      createdAt: now
    };

    this.transactions.set(id, transaction);
    return { ...transaction };
  }

  async findAllByUserId(userId: string, filterType: 'ALL' | 'INCOME' | 'EXPENSE' = 'ALL'): Promise<Transaction[]> {
    const userTransactions: Transaction[] = [];

    for (const tx of this.transactions.values()) {
      if (tx.userId === userId || userId === 'all' || !userId) {
        if (filterType === 'ALL' || tx.type === filterType) {
          userTransactions.push({ ...tx });
        }
      }
    }

    // Ordenar de más reciente a más antiguo
    return userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getSummaryByUserId(userId: string): Promise<TransactionSummary> {
    const list = await this.findAllByUserId(userId, 'ALL');

    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of list) {
      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        totalExpense += tx.amount;
      }
    }

    return {
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      transactionCount: list.length
    };
  }

  async findById(id: string): Promise<Transaction | null> {
    const tx = this.transactions.get(id);
    return tx ? { ...tx } : null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const tx = this.transactions.get(id);
    if (!tx || (tx.userId !== userId && userId !== 'all')) {
      return false;
    }
    return this.transactions.delete(id);
  }
}
