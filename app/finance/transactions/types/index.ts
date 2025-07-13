import { Types } from 'mongoose';

export interface Product {
  _id: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  weight?: string;
}

export interface FinancialTransaction {
  _id: string;
  type: 'expense' | 'income' | 'purchase';
  amount: number;
  category: string;
  description?: string;
  party?: string;
  date: string;
  invoiceNumber?: string;
  productId?: string | Types.ObjectId;
  quantity?: number;
  isRecurring: boolean;
  createdAt: string;
  debitAccount: string;
  creditAccount: string;
}

export type TransactionType = 'expense' | 'income' | 'purchase';
export type CategoryType = 'expense' | 'income' | 'purchase';
