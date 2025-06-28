import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'الرجاء إدخال الاسم'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'الرجاء إدخال البريد الإلكتروني'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'الرجاء إدخال بريد إلكتروني صحيح'],
    index: true,
  },
  password: {
    type: String,
    required: [true, 'الرجاء إدخال كلمة المرور'],
    minlength: [6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'],
    select: false, // لا يتم استرجاع كلمة المرور في الاستعلامات
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// تحقق ما إذا كان النموذج موجودًا بالفعل لتجنب إعادة تعريفه
export const User = mongoose.models.User || mongoose.model('User', userSchema);