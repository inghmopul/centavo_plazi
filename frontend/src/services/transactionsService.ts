import { apiClient } from './apiClient';
import type { Transaction, TransactionSummary, CreateTransactionInput } from '../types/transaction';

export const transactionsService = {
  async getTransactions(): Promise<Transaction[]> {
    try {
      return await apiClient.get<Transaction[]>('/transactions');
    } catch {
      // Estado inicial vacío según requerimiento del dashboard inicial
      return [];
    }
  },

  async getSummary(): Promise<TransactionSummary> {
    try {
      return await apiClient.get<TransactionSummary>('/transactions/summary');
    } catch {
      // Resumen inicial en ceros para estado vacío
      return {
        totalBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        transactionCount: 0,
      };
    }
  },

  async createTransaction(data: CreateTransactionInput): Promise<Transaction> {
    return await apiClient.post<Transaction>('/transactions', data);
  },
};
