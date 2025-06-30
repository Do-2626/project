import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// وظيفة للتحقق من صحة المدخلات
function validateLoginInput(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};

  if (!email) {
    errors.email = "البريد الإلكتروني مطلوب";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "البريد الإلكتروني غير صالح";
  }

  if (!password) {
    errors.password = "كلمة المرور مطلوبة";
  } else if (password.length < 6) {
    errors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// واجهة برمجية لتسجيل الدخول
// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // استخراج بيانات المستخدم من الطلب
    const { email, password } = await request.json();
    
    // التحقق من صحة المدخلات
    const { isValid, errors } = validateLoginInput(email, password);
    if (!isValid) {
      return NextResponse.json(
        { errors },
        { status: 400 }
      );
    }

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

    // إنشاء refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
      { expiresIn: "30d" }
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

    // إضافة refresh token
    response.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 يوم
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