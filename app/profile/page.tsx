"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // تجنب عدم تطابق الترميز بين الخادم والعميل
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-center">غير مصرح به</CardTitle>
            <CardDescription className="text-center">
              يجب عليك تسجيل الدخول لعرض هذه الصفحة
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => window.location.href = "/auth/login"}
              className="mt-4"
            >
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">الملف الشخصي</CardTitle>
          <CardDescription>
            مرحبًا بك في صفحة الملف الشخصي الخاصة بك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">الاسم</h3>
            <p className="text-lg font-medium">{user.name}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</h3>
            <p className="text-lg font-medium">{user.email}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">نوع الحساب</h3>
            <p className="text-lg font-medium capitalize">
              {user.role === "admin" ? "مدير" : "مستخدم"}
            </p>
          </div>
          
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => logout()}
              className="w-full sm:w-auto"
            >
              تسجيل الخروج
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}