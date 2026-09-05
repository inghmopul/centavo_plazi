export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  notes?: string;
  createdAt: Date;
}

export interface CreateTransactionData {
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date?: string;
  notes?: string;
}

export interface TransactionSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
}
