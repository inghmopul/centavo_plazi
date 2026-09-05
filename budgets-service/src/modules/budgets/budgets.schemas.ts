import { z } from 'zod';

const periodEnum = z.enum(['WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM', 'semanal', 'mensual', 'anual'], {
  errorMap: () => ({ message: "El período debe ser 'WEEKLY', 'MONTHLY', 'YEARLY' o 'CUSTOM' (o 'semanal', 'mensual')" })
}).transform((val) => {
  const normalized = val.toUpperCase();
  if (normalized === 'SEMANAL') return 'WEEKLY';
  if (normalized === 'MENSUAL') return 'MONTHLY';
  if (normalized === 'ANUAL') return 'YEARLY';
  return normalized as 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
});

export const createBudgetSchema = z.object({
  category: z.string().trim().min(1, 'La categoría es requerida'),
  limitAmount: z.coerce.number().positive('El monto límite debe ser un valor positivo mayor a cero'),
  period: periodEnum,
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const queryBudgetsSchema = z.object({
  category: z.string().optional(),
  period: z.string().optional()
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type QueryBudgetsInput = z.infer<typeof queryBudgetsSchema>;
