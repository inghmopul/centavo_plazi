import { IBudgetRepository } from '../../repositories/budgetRepository.interface.js';
import { Budget, BudgetFilterOptions } from '../../types/budget.types.js';
import { CreateBudgetInput } from './budgets.schemas.js';

export class BudgetsService {
  constructor(private budgetRepository: IBudgetRepository) {}

  async create(userId: string, input: CreateBudgetInput): Promise<Budget> {
    return this.budgetRepository.create({
      userId,
      category: input.category,
      limitAmount: input.limitAmount,
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate
    });
  }

  async getBudgets(userId: string, filters?: BudgetFilterOptions): Promise<Budget[]> {
    return this.budgetRepository.findAllByUserId(userId, filters);
  }

  async getBudgetById(id: string): Promise<Budget | null> {
    return this.budgetRepository.findById(id);
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    return this.budgetRepository.delete(id, userId);
  }
}
