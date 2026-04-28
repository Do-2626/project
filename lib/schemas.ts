import { z } from "zod";

// Base Schema for ID-based objects
export const BaseSchema = z.object({
  id: z.string().uuid().optional(),
  _id: z.string().uuid().optional(),
});

// Expense Category Schema
export const ExpenseCategorySchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  classification: z.enum(["تشغيلي", "إداري", "أخرى"]).optional(),
});

// Product Schema
export const ProductSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  sku: z.string().optional(),
  price: z.number().nonnegative("السعر يجب أن يكون 0 أو أكثر"),
  categoryId: z.string().uuid().optional(),
});

// Transaction Item Schema
export const TransactionItemSchema = z.object({
  productId: z.string().uuid("معرف المنتج غير صحيح"),
  quantity: z.number().positive("الكمية يجب أن تكون أكبر من 0"),
  price: z.number().nonnegative("السعر يجب أن يكون 0 أو أكثر"),
});

// Transaction Schema
export const TransactionSchema = z.object({
  type: z.enum(["sale", "purchase", "adjustment", "expense"]),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  contactId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  amount: z.number().nonnegative(),
  items: z.array(TransactionItemSchema).optional(),
});
