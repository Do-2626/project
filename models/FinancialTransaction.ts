import mongoose, { Schema, models, model, Types, Document } from 'mongoose';

// أنواع الحسابات المحاسبية
enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense'
}

export interface FinancialTransactionDocument extends Document {
  debitAccount: string;
  creditAccount: string;
  amount: number;
  category: string;
  description?: string;
  party?: string;
  date: Date;
  invoiceNumber?: string;
  referenceId?: Types.ObjectId;
  referenceModel?: 'Product' | 'Transaction';
  isRecurring: boolean;
  status: 'pending' | 'posted' | 'reconciled';
  createdAt: Date;
}

const FinancialTransactionSchema = new Schema<FinancialTransactionDocument>({
  debitAccount: {
    type: String,
    ref: 'Account',
    required: [true, 'يجب تحديد الحساب المدين']
  }, 
  creditAccount: {
    type: String,
    ref: 'Account',
    required: [true, 'يجب تحديد الحساب الدائن']
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  category: { 
    type: String, 
    required: true,
    index: true
  },
  description: { 
    type: String 
  },
  party: { 
    type: String 
  },
  date: { 
    type: Date, 
    required: true,
    index: true
  },
  invoiceNumber: { 
    type: String 
  },
  referenceId: { 
    type: Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Product', 'Transaction'],
    required: false
  },
  // حذف حقل الكمية غير الضروري
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  status: {
    type: String,
    enum: ['pending', 'posted', 'reconciled'],
    default: 'posted'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add validation to schema before creating model
FinancialTransactionSchema.path('debitAccount').validate({
  validator: function(value: string) {
    return value !== this.creditAccount;
  },
  message: 'الحساب المدين والدائن يجب أن يكونا مختلفين'
});

export default models.FinancialTransaction || model<FinancialTransactionDocument>('FinancialTransaction', FinancialTransactionSchema);
