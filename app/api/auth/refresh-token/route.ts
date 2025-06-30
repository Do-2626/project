import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/lib/models/user";
import { connectDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const refreshToken = request.cookies.get("refreshToken")?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    // التحقق من صحة refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
    ) as jwt.JwtPayload;

    // التحقق من وجود المستخدم
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 401 }
      );
    }

    // إنشاء توكن جديد
    const newToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // إنشاء refresh token جديد
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
      { expiresIn: "30d" }
    );

    // إعداد الاستجابة
    const response = NextResponse.json(
      {
        message: "تم تحديث التوكن بنجاح",
      },
      { status: 200 }
    );

    // تحديث التوكن في ملفات تعريف الارتباط
    response.cookies.set({
      name: "token",
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "غير مصرح لك بالوصول" },
      { status: 401 }
    );
  }
}
