import mongoose, { Schema, models, model } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  weight: { type: String },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default models.Product || model('Product', ProductSchema);
