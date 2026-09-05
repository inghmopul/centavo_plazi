export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: number;
  period: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBudgetData {
  userId: string;
  category: string;
  limitAmount: number;
  period: BudgetPeriod;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBudgetData {
  category?: string;
  limitAmount?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
}

export interface BudgetFilterOptions {
  category?: string;
  period?: BudgetPeriod;
}
