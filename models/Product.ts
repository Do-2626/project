import { Schema, model, models } from 'mongoose';

// تعريف سكيما المنتج
const ProductSchema = new Schema({
  name: { type: String, required: true }, // اسم المنتج (مطلوب)
  weight: String, // الوزن (اختياري)
  purchasePrice: { type: Number, required: true }, // سعر الشراء (مطلوب)
  sellingPrice: { type: Number, required: true }, // سعر البيع (مطلوب)
}, { 
  timestamps: true // إضافة الحقلين createdAt و updatedAt تلقائياً
});

// تصدير الموديل: إذا كان موجوداً بالفعل نستخدمه، وإلا ننشئ جديداً
export default models.Product || model('Product', ProductSchema);