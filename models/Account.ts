import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface AccountDocument extends Document {
  name: string;
  code: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

const AccountSchema = new Schema<AccountDocument>({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['asset', 'liability', 'equity', 'revenue', 'expense'], required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default models.Account || model<AccountDocument>('Account', AccountSchema);