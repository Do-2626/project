import mongoose, { Schema, models, model } from 'mongoose';

const BranchSchema = new Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String },
  isActive: { type: Boolean, default: true },
  settlementType: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  createdAt: { type: Date, default: Date.now }
});

// Force deletion of model in development to ensure schema updates
if (process.env.NODE_ENV === 'development') {
  delete models.Branch;
}

export default models.Branch || model('Branch', BranchSchema);
