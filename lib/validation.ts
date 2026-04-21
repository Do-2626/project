import { z } from 'zod';

export const transactionSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  type: z.enum(['purchase', 'outgoing', 'incoming', 'damaged', 'expense', 'income', 'sale']),
  party: z.string().optional(),
  contactId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().optional(),
  category: z.string().optional(),
  expenseCategoryId: z.string().uuid().optional(),
  branchId: z.string().uuid().nullable().optional(),
  isRecurring: z.boolean().optional(),
});

export const transactionUpdateSchema = transactionSchema.partial();