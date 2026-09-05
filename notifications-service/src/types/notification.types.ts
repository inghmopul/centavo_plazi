export type NotificationType = 'BUDGET_EXCEEDED' | 'BUDGET_WARNING' | 'INFO';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  category: string;
  channel: NotificationChannel;
  metadata?: {
    transactionId?: string;
    transactionAmount?: number;
    budgetLimit?: number;
    currentSpent?: number;
    percentageUsed?: number;
    excessAmount?: number;
  };
  read: boolean;
  createdAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  category: string;
  channel?: NotificationChannel;
  metadata?: Notification['metadata'];
}

export interface TransactionEventInput {
  transactionId?: string;
  userId?: string;
  title?: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  category: string;
  date?: string;
}

export interface BudgetInfo {
  id: string;
  userId: string;
  category: string;
  limitAmount: number;
  period: string;
}

export interface AlertEvaluationResult {
  alertGenerated: boolean;
  reason?: string;
  notification?: Notification;
  budgetComparison?: {
    category: string;
    limitAmount: number;
    totalSpent: number;
    percentageUsed: number;
    isOverBudget: boolean;
    excessAmount: number;
  };
}
