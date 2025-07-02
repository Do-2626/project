
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(loginEmail, loginPassword);
    } catch (error) {
      // Error is handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signUp(signupEmail, signupPassword, fullName);
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك",
      });
    } catch (error) {
      // Error is handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-opacity-90 px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dairy-800">نظام النور</h1>
          <p className="text-muted-foreground mt-2">نظام إدارة توزيع منتجات الألبان</p>
        </div>

        <Card className="paper-card border-t-4 border-t-dairy-500">
          <CardHeader>
            <CardTitle className="text-center">الوصول إلى حسابك</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full">

              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="أدخل كلمة المرور"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-dairy-600 hover:bg-dairy-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </Button>
                  </div>
                </div>
              </form> 
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        © 2025 نظام النور. جميع الحقوق محفوظة.
      </p>
    </div>
    </div >
  );
};

export default Login;
