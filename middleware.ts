import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// المسارات التي تتطلب المصادقة
const protectedRoutes = [
  "/profile",
  "/cast/add",
  "/cast/map",
];

// المسارات التي لا تتطلب المصادقة (للمستخدمين غير المسجلين)
const authRoutes = [
  "/auth/login",
  "/auth/register",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // الحصول على الرمز من ملف تعريف الارتباط
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = !!token;
  
  // التحقق من صحة الرمز للمسارات المحمية
  if (protectedRoutes.some(route => path.startsWith(route))) {
    if (!isAuthenticated) {
      // إعادة توجيه المستخدم غير المصادق إلى صفحة تسجيل الدخول
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    try {
      // التحقق من صحة الرمز
      if (token) {
        await jwtVerify(
          token,
          new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
        );
      }
    } catch (error) {
      // إذا كان الرمز غير صالح، قم بإعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }
  
  // منع المستخدمين المصادقين من الوصول إلى صفحات تسجيل الدخول/التسجيل
  if (authRoutes.some(route => path.startsWith(route)) && isAuthenticated) {
    // إعادة توجيه المستخدم المصادق إلى الصفحة الرئيسية
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return NextResponse.next();
}

// تكوين المسارات التي سيتم تطبيق الوسيط عليها
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)"  
  ],
};