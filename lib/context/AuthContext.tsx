"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // وظيفة لتحديث التوكن
  const refreshToken = async () => {
    try {
      const res = await fetch("/api/auth/refresh-token", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("فشل تحديث التوكن");
      }

      // تحديث معلومات المستخدم بعد تحديث التوكن
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meData = await meRes.json();

      if (meRes.ok) {
        setUser(meData.user);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setUser(null);
    }
  };

  // التحقق من حالة المصادقة عند تحميل التطبيق
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        } else if (res.status === 401) {
          // محاولة تحديث التوكن إذا كان التوكن الحالي منتهي الصلاحية
          await refreshToken();
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();

    // إعداد مؤقت لتحديث التوكن كل 6 أيام
    const refreshInterval = setInterval(refreshToken, 6 * 24 * 60 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // تسجيل الدخول
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.errors?.email || data.errors?.password || "فشل تسجيل الدخول");
      }

      setUser(data.user);
    } catch (error: any) {
      setError(error.message);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // تسجيل مستخدم جديد
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل التسجيل");
      }

      // تسجيل الدخول مباشرة بعد التسجيل
      await login(email, password);
    } catch (error: any) {
      setError(error.message);
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الخروج
  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("فشل تسجيل الخروج");
      }

      setUser(null);
    } catch (error: any) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook لاستخدام سياق المصادقة
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}