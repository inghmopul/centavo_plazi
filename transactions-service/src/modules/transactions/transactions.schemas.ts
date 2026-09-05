import { z } from 'zod';

export const createTransactionSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  amount: z.coerce.number().positive('El monto debe ser un valor positivo mayor a cero'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: "El tipo debe ser 'INCOME' o 'EXPENSE'" })
  }),
  category: z.string().min(1, 'La categoría es requerida'),
  date: z.string().optional(),
  notes: z.string().optional()
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
