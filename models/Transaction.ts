import mongoose, { Schema, models, model, Types } from 'mongoose';

const TransactionSchema = new Schema({
  productId: { type: Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ['purchase', 'outgoing', 'incoming', 'damaged', 'expense', 'income'], required: true },
  party: { type: String }, // الجهة
  date: { type: String, required: true }, // YYYY-MM-DD
  amount: { type: Number }, // المبلغ المالي
  category: { type: String }, // تصنيف المعاملة
  isRecurring: { type: Boolean, default: false }, // معاملة متكررة
  createdAt: { type: Date, default: Date.now }
});

export default models.Transaction || model('Transaction', TransactionSchema);
