import mongoose, { Schema, models, model } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  weight: { type: String },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Force deletion of model in development to ensure schema updates
if (process.env.NODE_ENV === 'development') {
  delete models.Product;
}

export default models.Product || model('Product', ProductSchema);
