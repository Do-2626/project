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
      // إرجاع عدم وجود مستخدم
      return NextResponse.json({
        user: null,
        isAuthenticated: false
      }, { status: 200 });
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
      // إرجاع عدم وجود مستخدم
      return NextResponse.json({
        user: null,
        isAuthenticated: false
      }, { status: 200 });
    }
    
    // إرجاع بيانات المستخدم
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Error getting current user:", error);
    // في حالة أي خطأ، إرجاع عدم وجود مستخدم
    return NextResponse.json({
      user: null,
      isAuthenticated: false
    }, { status: 200 });
  }
}