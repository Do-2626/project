import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// واجهة برمجية لتسجيل الدخول
// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // استخراج بيانات المستخدم من الطلب
    const { email, password } = await request.json();
    
    // التحقق من وجود المستخدم
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }
    
    // التحقق من صحة كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }
    
    // إنشاء رمز JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );
    
    // إعداد الاستجابة مع ملف تعريف الارتباط
    const response = NextResponse.json(
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "تم تسجيل الدخول بنجاح",
      },
      { status: 200 }
    );
    
    // إضافة ملف تعريف الارتباط للاستجابة
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 أيام
      path: "/",
    });
    
    return response;
  } catch (error: any) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}