import { z } from 'zod';

export const transactionEventSchema = z.object({
  transactionId: z.string().optional(),
  userId: z.string().optional(),
  title: z.string().optional(),
  amount: z.coerce.number().positive('El monto debe ser mayor a cero'),
  type: z.enum(['EXPENSE', 'INCOME'], {
    errorMap: () => ({ message: "El tipo debe ser 'EXPENSE' o 'INCOME'" })
  }),
  category: z.string().trim().min(1, 'La categoría es requerida'),
  date: z.string().optional(),
  // Opcional para pruebas directas o simulación de presupuesto previo
  currentSpent: z.coerce.number().nonnegative().optional(),
  budgetLimit: z.coerce.number().positive().optional()
});

export type TransactionEventInput = z.infer<typeof transactionEventSchema>;
