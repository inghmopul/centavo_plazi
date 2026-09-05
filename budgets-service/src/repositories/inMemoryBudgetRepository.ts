import { IBudgetRepository } from './budgetRepository.interface.js';
import { Budget, CreateBudgetData, UpdateBudgetData, BudgetFilterOptions, BudgetPeriod } from '../types/budget.types.js';

export class InMemoryBudgetRepository implements IBudgetRepository {
  private budgets: Map<string, Budget> = new Map();

  async create(data: CreateBudgetData): Promise<Budget> {
    const id = `bdg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const budget: Budget = {
      id,
      userId: data.userId,
      category: data.category.trim(),
      limitAmount: Number(data.limitAmount),
      period: data.period,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: now,
      updatedAt: now
    };

    this.budgets.set(id, budget);
    return { ...budget };
  }

  async findAllByUserId(userId: string, filters?: BudgetFilterOptions): Promise<Budget[]> {
    const userBudgets: Budget[] = [];

    for (const item of this.budgets.values()) {
      if (item.userId === userId || userId === 'all' || !userId) {
        let matches = true;

        if (filters?.category && item.category.toLowerCase() !== filters.category.toLowerCase()) {
          matches = false;
        }

        if (filters?.period && item.period !== filters.period) {
          matches = false;
        }

        if (matches) {
          userBudgets.push({ ...item });
        }
      }
    }

    // Ordenar por fecha de creación descendente
    return userBudgets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string): Promise<Budget | null> {
    const budget = this.budgets.get(id);
    return budget ? { ...budget } : null;
  }

  async findByCategoryAndPeriod(userId: string, category: string, period: string): Promise<Budget | null> {
    for (const item of this.budgets.values()) {
      if (
        (item.userId === userId || !userId) &&
        item.category.toLowerCase() === category.toLowerCase() &&
        item.period.toUpperCase() === period.toUpperCase()
      ) {
        return { ...item };
      }
    }
    return null;
  }

  async update(id: string, userId: string, data: UpdateBudgetData): Promise<Budget | null> {
    const budget = this.budgets.get(id);
    if (!budget || (budget.userId !== userId && userId !== 'all')) {
      return null;
    }

    const updated: Budget = {
      ...budget,
      category: data.category !== undefined ? data.category.trim() : budget.category,
      limitAmount: data.limitAmount !== undefined ? Number(data.limitAmount) : budget.limitAmount,
      period: data.period !== undefined ? data.period : budget.period,
      startDate: data.startDate !== undefined ? data.startDate : budget.startDate,
      endDate: data.endDate !== undefined ? data.endDate : budget.endDate,
      updatedAt: new Date()
    };

    this.budgets.set(id, updated);
    return { ...updated };
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const budget = this.budgets.get(id);
    if (!budget || (budget.userId !== userId && userId !== 'all')) {
      return false;
    }
    return this.budgets.delete(id);
  }
}
