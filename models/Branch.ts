import mongoose, { Schema, models, model } from 'mongoose';

const BranchSchema = new Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default models.Branch || model('Branch', BranchSchema);
