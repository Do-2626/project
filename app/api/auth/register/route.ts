import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// واجهة برمجية لتسجيل مستخدم جديد
// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // استخراج بيانات المستخدم من الطلب
    const { name, email, password } = await request.json();
    
    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      );
    }
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // إنشاء مستخدم جديد
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    
    // إرجاع بيانات المستخدم بدون كلمة المرور
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء تسجيل المستخدم" },
      { status: 500 }
    );
  }
}