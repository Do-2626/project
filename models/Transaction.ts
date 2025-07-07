import mongoose, { Schema, models, model, Types } from 'mongoose';

const TransactionSchema = new Schema({
  productId: { type: Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ['purchase', 'outgoing', 'incoming', 'damaged'], required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

export default models.Transaction || model('Transaction', TransactionSchema);
