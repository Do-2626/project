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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // التحقق من حالة المصادقة عند تحميل التطبيق
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
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
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
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
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل التسجيل");
      }

      // بعد التسجيل الناجح، قم بتسجيل الدخول تلقائيًا
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
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/logout");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل تسجيل الخروج");
      }

      setUser(null);
    } catch (error: any) {
      setError(error.message);
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  // مسح الأخطاء
  const clearError = () => {
    setError(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// هوك مخصص لاستخدام سياق المصادقة
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}