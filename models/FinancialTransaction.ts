import mongoose, { Schema, models, model, Types } from 'mongoose';

const FinancialTransactionSchema = new Schema({
  type: { 
    type: String, 
    enum: ['expense', 'income', 'purchase'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  party: { 
    type: String 
  },
  date: { 
    type: String, 
    required: true 
  }, // YYYY-MM-DD
  invoiceNumber: { 
    type: String 
  },
  productId: { 
    type: Types.ObjectId, 
    ref: 'Product' 
  }, // فقط للمشتريات
  quantity: { 
    type: Number 
  }, // فقط للمشتريات
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default models.FinancialTransaction || model('FinancialTransaction', FinancialTransactionSchema);
