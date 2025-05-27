import { NextResponse } from "next/server";

// واجهة برمجية لتسجيل الخروج
// GET /api/auth/logout
export async function GET() {
  try {
    // إنشاء استجابة
    const response = NextResponse.json(
      { message: "تم تسجيل الخروج بنجاح" },
      { status: 200 }
    );
    
    // حذف ملف تعريف الارتباط
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // انتهاء الصلاحية فورًا
      path: "/",
    });
    
    return response;
  } catch (error: any) {
    console.error("Error logging out:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء تسجيل الخروج" },
      { status: 500 }
    );
  }
}