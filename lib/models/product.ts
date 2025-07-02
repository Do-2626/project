import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  weight: { type: Number },
  purchase_price: { type: Number, required: true },
  price_selling: { type: Number, required: true },
  current_stock: { type: Number, required: true },
  updated_at: { type: Date, required: true },
  created_at: { type: Date, required: true },
});

export default mongoose.models.Product_new || mongoose.model('Product_new', ProductSchema);

