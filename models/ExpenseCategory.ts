import mongoose, { Schema, models, model } from 'mongoose';

const ExpenseCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  classification: {
    type: String,
    enum: ['تشغيلي', 'إداري', 'أخرى'],
    default: 'تشغيلي'
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Force deletion of model in development to ensure schema updates
if (process.env.NODE_ENV === 'development') {
  delete models.ExpenseCategory;
}

export default models.ExpenseCategory || model('ExpenseCategory', ExpenseCategorySchema);
