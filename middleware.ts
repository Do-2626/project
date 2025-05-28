import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// المسارات التي لا تتطلب المصادقة (للمستخدمين غير المسجلين)
const publicRoutes = [
  "/auth/login",
  "/auth/register",
];

// المسارات المستثناة من الوسيط
const excludedRoutes = [
  "/api",
  "/_next/static",
  "/_next/image",
  "/favicon.ico",
  "/images",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // التحقق مما إذا كان المسار من المسارات العامة
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
  
  // التحقق مما إذا كان المسار مستثنى
  const isExcludedRoute = excludedRoutes.some(route => path.startsWith(route));
  
  // الحصول على الرمز من ملف تعريف الارتباط
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = !!token;
  
  // إذا كان المسار مستثنى، السماح بالوصول
  if (isExcludedRoute) {
    return NextResponse.next();
  }
  
  // إذا كان المسار عامًا والمستخدم مصادق، إعادة توجيهه إلى صفحة المهام
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  // إذا كان المسار ليس عامًا والمستخدم غير مصادق، إعادة توجيهه إلى صفحة تسجيل الدخول
  if (!isPublicRoute && !isAuthenticated) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // التحقق من صحة الرمز إذا كان المستخدم مصادق
  if (isAuthenticated) {
    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
      );
    } catch (error) {
      // إذا كان الرمز غير صالح، قم بإعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// تكوين المسارات التي سيتم تطبيق الوسيط عليها
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)"
  ],
};