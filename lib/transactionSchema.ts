import { z } from 'zod';

export const FinancialTransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ غير صحيح'),
  description: z.string().min(3, 'الوصف يجب أن يكون على الأقل 3 أحرف'),
  amount: z.number().positive('المبلغ يجب أن يكون رقم موجب'),
  debitAccount: z.string().min(1, 'الحساب المدين مطلوب'),
  creditAccount: z.string().min(1, 'الحساب الدائن مطلوب'),
  referenceModel: z.enum(['Product', 'None']).optional(),
  referenceId: z.string().optional().nullable(),
  status: z.enum(['draft', 'posted']).default('posted')
});

export type FinancialTransactionType = z.infer<typeof FinancialTransactionSchema>;