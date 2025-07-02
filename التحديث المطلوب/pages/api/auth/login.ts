import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI as string;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'الرجاء إدخال اسم المستخدم وكلمة المرور' });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيح' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيح' });
  }

  // هنا يمكنك إنشاء توكن JWT أو جلسة
  // لأغراض التبسيط سنعيد بيانات المستخدم فقط (بدون كلمة المرور)
  const { password: _, ...userData } = user.toObject();
  return res.status(200).json({ user: userData });
}
