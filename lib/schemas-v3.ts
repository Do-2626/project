// lib/schemas-v3.ts

import { z } from "zod";

// --- 1. مخطط أصناف المصاريف (Expense Categories) ---
// مستوحى من جدول expense_categories [1]
export const expenseCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "الاسم مطلوب"),
  classification: z.enum(["تشغيلي", "إداري", "أخرى"]).default("تشغيلي"),
  is_active: z.boolean().default(true),
});

// --- 2. مخطط المنتجات (Products) ---
// مستوحى من جدول products [2]
export const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "اسم المنتج مطلوب"),
  weight: z.string().optional().nullable(),
  purchase_price: z.coerce.number().min(0).default(0),
  selling_price: z.coerce.number().min(0).default(0),
});

// --- 3. مخطط الفروع (Branches) ---
// مستوحى من جدول branches [2]
export const branchSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "اسم الفرع مطلوب"),
  location: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  settlement_type: z.enum(["daily", "weekly"]).default("daily"),
});

// --- 4. مخطط جهات الاتصال (Contacts) ---
// مستوحى من جدول contacts [3]
export const contactSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "الاسم مطلوب"),
  type: z.enum(["customer", "supplier", "other"]).default("other"),
  phone: z.string().optional().nullable(),
});

// --- 5. مخطط العمليات المخزنية (Transactions) ---
// مستوحى من جدول transactions [3]
export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid("يجب اختيار منتج صحيح"),
  quantity: z.coerce.number().min(0.01, "الكمية يجب أن تكون أكبر من صفر"),
  type: z.enum(["purchase", "outgoing", "incoming", "damaged", "expense", "income", "sale"]),
  party: z.string().optional().nullable(),
  date: z.string().or(z.date()), // يدعم التعامل مع التواريخ كـ String أو Date [3]
  amount: z.coerce.number().optional().nullable(),
  category: z.string().optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
  is_recurring: z.boolean().default(false),
});

// --- 6. مخطط العمليات المالية (Financial Transactions) ---
// مستوحى من جدول financial_transactions [4]
export const financialTransactionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["expense", "income", "purchase"]),
  amount: z.coerce.number().min(0),
  category: z.string().min(1, "التصنيف مطلوب"),
  description: z.string().optional().nullable(),
  party: z.string().optional().nullable(),
  date: z.string().or(z.date()),
  invoice_number: z.string().optional().nullable(),
  product_id: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
  expense_category_id: z.string().uuid().optional().nullable(),
  expense_subtype: z.string().optional().nullable(),
  transaction_id: z.string().uuid().optional().nullable(),
  is_recurring: z.boolean().default(false),
});

// --- 7. مخطط الأرصدة الافتتاحية (Inventory Snapshots) ---
// مستوحى من جدول inventory_snapshots [5]
export const inventorySnapshotSchema = z.object({
  id: z.string().uuid().optional(),
  snapshot_date: z.string().or(z.date()),
  product_id: z.string().uuid(),
  branch_id: z.string().uuid(),
  quantity_on_hand: z.coerce.number().default(0),
});

// أنواع البيانات المستخرجة (Types Export)
export type Product = z.infer<typeof productSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type FinancialTransaction = z.infer<typeof financialTransactionSchema>;
export type Branch = z.infer<typeof branchSchema>;
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type Contact = z.infer<typeof contactSchema>;
export type InventorySnapshot = z.infer<typeof inventorySnapshotSchema>;
