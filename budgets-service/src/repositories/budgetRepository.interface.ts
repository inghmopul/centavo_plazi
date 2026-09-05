import { Budget, CreateBudgetData, UpdateBudgetData, BudgetFilterOptions } from '../types/budget.types.js';

export interface IBudgetRepository {
  create(data: CreateBudgetData): Promise<Budget>;
  findAllByUserId(userId: string, filters?: BudgetFilterOptions): Promise<Budget[]>;
  findById(id: string): Promise<Budget | null>;
  findByCategoryAndPeriod(userId: string, category: string, period: string): Promise<Budget | null>;
  update(id: string, userId: string, data: UpdateBudgetData): Promise<Budget | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
