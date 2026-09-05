import { useState, useEffect, useCallback } from 'react';
import { transactionsService } from '../services/transactionsService';
import type { Transaction, TransactionSummary } from '../types/transaction';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, summaryData] = await Promise.all([
        transactionsService.getTransactions(),
        transactionsService.getSummary(),
      ]);
      setTransactions(data);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (data: Parameters<typeof transactionsService.createTransaction>[0]) => {
    const newTx = await transactionsService.createTransaction(data);
    await fetchTransactions();
    return newTx;
  };

  return {
    transactions,
    summary,
    isLoading,
    error,
    addTransaction,
    refreshTransactions: fetchTransactions,
    isEmpty: transactions.length === 0,
  };
}
