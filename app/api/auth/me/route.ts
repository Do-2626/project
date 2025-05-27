import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// واجهة برمجية للحصول على بيانات المستخدم الحالي
// GET /api/auth/me
export async function GET(request: NextRequest) {
  try {
    // الحصول على الرمز من ملف تعريف الارتباط
    const token = request.cookies.get("token")?.value;
    
    // التحقق من وجود الرمز
    if (!token) {
      return NextResponse.json(
        { error: "غير مصرح به، الرجاء تسجيل الدخول" },
        { status: 401 }
      );
    }
    
    // التحقق من صحة الرمز
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { id: string };
    
    // الاتصال بقاعدة البيانات
    await connectDB();
    
    // البحث عن المستخدم
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }
    
    // إرجاع بيانات المستخدم
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Error getting current user:", error);
    
    // التحقق من نوع الخطأ
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json(
        { error: "غير مصرح به، الرجاء تسجيل الدخول مرة أخرى" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء الحصول على بيانات المستخدم" },
      { status: 500 }
    );
  }
}