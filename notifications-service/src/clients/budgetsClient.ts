import { BudgetInfo } from '../types/notification.types.js';

export interface IBudgetsClient {
  getBudgetsByUser(userId: string, token?: string): Promise<BudgetInfo[]>;
  getBudgetByCategory(userId: string, category: string, token?: string): Promise<BudgetInfo | null>;
  calculateSpentByCategory(userId: string, category: string, token?: string): Promise<number>;
}

export class HttpBudgetsClient implements IBudgetsClient {
  constructor(
    private budgetsServiceUrl: string,
    private transactionsServiceUrl: string
  ) {}

  async getBudgetsByUser(userId: string, token?: string): Promise<BudgetInfo[]> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${this.budgetsServiceUrl}/api/budgets`, { headers });
      if (!res.ok) return [];
      const data = (await res.json()) as BudgetInfo[];
      return data.filter((b) => b.userId === userId || !b.userId);
    } catch {
      return [];
    }
  }

  async getBudgetByCategory(userId: string, category: string, token?: string): Promise<BudgetInfo | null> {
    try {
      const budgets = await this.getBudgetsByUser(userId, token);
      const match = budgets.find(
        (b) => b.category.trim().toLowerCase() === category.trim().toLowerCase()
      );
      return match || null;
    } catch {
      return null;
    }
  }

  async calculateSpentByCategory(userId: string, category: string, token?: string): Promise<number> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${this.transactionsServiceUrl}/api/transactions?type=EXPENSE`, { headers });
      if (!res.ok) return 0;
      const transactions = (await res.json()) as Array<{
        category: string;
        amount: number;
        type: string;
        userId?: string;
      }>;

      const spent = transactions
        .filter(
          (t) =>
            t.type === 'EXPENSE' &&
            t.category?.toLowerCase() === category.toLowerCase() &&
            (!t.userId || t.userId === userId)
        )
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      return spent;
    } catch {
      return 0;
    }
  }
}
