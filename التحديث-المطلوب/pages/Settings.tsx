import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Building, Gauge, Bell, Shield, Download, UserPlus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [newUserEmail, setNewUserEmail] = React.useState('');
  const [newUserPassword, setNewUserPassword] = React.useState('');
  const [newUserFullName, setNewUserFullName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "تم إنشاء المستخدم بنجاح",
        description: "تم إضافة المستخدم الجديد إلى النظام (وهمياً)"
      });
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserFullName('');
      setIsLoading(false);
    }, 700);
  };

  return (
    <MainLayout title="الإعدادات">
      <Tabs defaultValue="profile" className="w-full">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 space-y-6">
            <Card className="paper-card">
              <CardContent className="p-4">
                <TabsList className="flex flex-col w-full h-auto bg-transparent space-y-1">
                  <TabsTrigger 
                    value="profile" 
                    className="justify-start w-full data-[state=active]:bg-dairy-50 data-[state=active]:text-dairy-900"
                  >
                    <UserCog className="ml-2 h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="company" 
                    className="justify-start w-full data-[state=active]:bg-dairy-50 data-[state=active]:text-dairy-900"
                  >
                    <Building className="ml-2 h-4 w-4" />
                    <span>معلومات الشركة</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="system" 
                    className="justify-start w-full data-[state=active]:bg-dairy-50 data-[state=active]:text-dairy-900"
                  >
                    <Gauge className="ml-2 h-4 w-4" />
                    <span>إعدادات النظام</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="justify-start w-full data-[state=active]:bg-dairy-50 data-[state=active]:text-dairy-900"
                  >
                    <Bell className="ml-2 h-4 w-4" />
                    <span>التنبيهات</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="justify-start w-full data-[state=active]:bg-dairy-50 data-[state=active]:text-dairy-900"
                  >
                    <Shield className="ml-2 h-4 w-4" />
                    <span>الأمان</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    className="justify-start w-full data-[state=active]:bg-dairy-50 data-[state=active]:text-dairy-900"
                  >
                    <Users className="ml-2 h-4 w-4" />
                    <span>إدارة المستخدمين</span>
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            <Card className="paper-card">
              <CardContent className="p-4">
                <div className="space-y-4 text-sm">
                  <h3 className="font-medium">معلومات النظام</h3>
                  <div>
                    <p className="text-muted-foreground">الإصدار:</p>
                    <p>توتى بيروتى v1.0.0</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">آخر تحديث:</p>
                    <p>5 أبريل 2025</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1">
                    <Download className="h-4 w-4" />
                    تحميل دليل المستخدم
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <TabsContent value="profile" className="m-0">
              <Card className="paper-card">
                <CardHeader>
                  <CardTitle>الملف الشخصي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم</Label>
                      <Input id="name" placeholder="أدخل اسمك" defaultValue="المستخدم الحالي" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input id="email" type="email" placeholder="أدخل بريدك الإلكتروني" defaultValue="user@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input id="phone" placeholder="أدخل رقم هاتفك" defaultValue="05xxxxxxxx" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">الدور الوظيفي</Label>
                      <Select defaultValue="admin">
                        <SelectTrigger id="role">
                          <SelectValue placeholder="اختر الدور الوظيفي" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">مدير النظام</SelectItem>
                          <SelectItem value="accountant">محاسب</SelectItem>
                          <SelectItem value="inventory">مسؤول المخزون</SelectItem>
                          <SelectItem value="sales">مندوب مبيعات</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">الصورة الشخصية</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-dairy-100 flex items-center justify-center text-dairy-800 text-xl">
                        م
                      </div>
                      <Button variant="outline" size="sm">تغيير الصورة</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signature">التوقيع</Label>
                    <div className="border rounded-md p-4 h-24 bg-muted/30">
                      <p className="text-muted-foreground text-center">لم يتم إضافة توقيع بعد</p>
                    </div>
                    <Button variant="outline" size="sm">إضافة توقيع</Button>
                  </div>

                  <div className="pt-4 flex justify-end space-x-2">
                    <Button variant="outline">إلغاء</Button>
                    <Button>حفظ التغييرات</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="m-0">
              <Card className="paper-card">
                <CardHeader>
                  <CardTitle>معلومات الشركة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">اسم الشركة</Label>
                      <Input id="company-name" placeholder="أدخل اسم الشركة" defaultValue="شركة منتجات الألبان" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-number">الرقم الضريبي</Label>
                      <Input id="tax-number" placeholder="أدخل الرقم الضريبي" defaultValue="300xxxxxxxxx" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">العنوان</Label>
                      <Input id="address" placeholder="أدخل عنوان الشركة" defaultValue="مصر" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">هاتف التواصل</Label>
                      <Input id="contact" placeholder="أدخل هاتف التواصل" defaultValue="011xxxxxxx" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">شعار الشركة</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 rounded bg-dairy-100 flex items-center justify-center text-dairy-800">
                        <Building className="h-12 w-12" />
                      </div>
                      <Button variant="outline" size="sm">تغيير الشعار</Button>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end space-x-2">
                    <Button variant="outline">إلغاء</Button>
                    <Button>حفظ التغييرات</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="m-0">
              <Card className="paper-card">
                <CardHeader>
                  <CardTitle>إدارة المستخدمين</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium mb-4">إضافة مستخدم جديد</h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newUserFullName">الاسم الكامل</Label>
                          <Input
                            id="newUserFullName"
                            value={newUserFullName}
                            onChange={(e) => setNewUserFullName(e.target.value)}
                            placeholder="أدخل الاسم الكامل"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newUserEmail">البريد الإلكتروني</Label>
                          <Input
                            id="newUserEmail"
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="أدخل البريد الإلكتروني"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newUserPassword">كلمة المرور</Label>
                          <Input
                            id="newUserPassword"
                            type="password"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            placeholder="أدخل كلمة المرور"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newUserRole">الدور الوظيفي</Label>
                          <Select defaultValue="user">
                            <SelectTrigger id="newUserRole">
                              <SelectValue placeholder="اختر الدور الوظيفي" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">مدير النظام</SelectItem>
                              <SelectItem value="user">مستخدم</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          {isLoading ? "جاري إنشاء المستخدم..." : "إضافة مستخدم جديد"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="m-0">
              <Card className="paper-card">
                <CardHeader>
                  <CardTitle>إعدادات النظام</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">تنسيق التاريخ</h3>
                        <p className="text-sm text-muted-foreground">اختر تنسيق عرض التاريخ</p>
                      </div>
                      <Select defaultValue="dd-mm-yyyy">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="تنسيق التاريخ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd-mm-yyyy">يوم-شهر-سنة</SelectItem>
                          <SelectItem value="mm-dd-yyyy">شهر-يوم-سنة</SelectItem>
                          <SelectItem value="yyyy-mm-dd">سنة-شهر-يوم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">العملة</h3>
                        <p className="text-sm text-muted-foreground">اختر عملة النظام</p>
                      </div>
                      <Select defaultValue="egy">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="العملة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="egy">جنيه مصرى (ج.م)</SelectItem>
                          <SelectItem value="sar">ريال سعودي (ر.س)</SelectItem>
                          <SelectItem value="usd">دولار أمريكي ($)</SelectItem>
                          <SelectItem value="eur">يورو (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">اللغة</h3>
                        <p className="text-sm text-muted-foreground">اختر لغة النظام</p>
                      </div>
                      <Select defaultValue="ar">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="اللغة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">الوضع الداكن</h3>
                        <p className="text-sm text-muted-foreground">تفعيل الوضع الداكن</p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end space-x-2">
                    <Button variant="outline">إلغاء</Button>
                    <Button>حفظ التغييرات</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="m-0">
              <Card className="paper-card">
                <CardHeader>
                  <CardTitle>إعدادات التنبيهات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">تنبيهات المخزون</h3>
                        <p className="text-sm text-muted-foreground">تنبيهات عند انخفاض المخزون</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">تنبيهات انتهاء الصلاحية</h3>
                        <p className="text-sm text-muted-foreground">تنبيهات عند اقتراب انتهاء الصلاحية</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">تنبيهات الفواتير</h3>
                        <p className="text-sm text-muted-foreground">تنبيهات عند استحقاق الفواتير</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">تنبيهات البريد الإلكتروني</h3>
                        <p className="text-sm text-muted-foreground">إرسال التنبيهات عبر البريد الإلكتروني</p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end space-x-2">
                    <Button variant="outline">إلغاء</Button>
                    <Button>حفظ التغييرات</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="m-0">
              <Card className="paper-card">
                <CardHeader>
                  <CardTitle>إعدادات الأمان</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                      <Input id="current-password" type="password" placeholder="أدخل كلمة المرور الحالية" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                      <Input id="new-password" type="password" placeholder="أدخل كلمة المرور الجديدة" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                      <Input id="confirm-password" type="password" placeholder="أكد كلمة المرور الجديدة" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end space-x-2">
                    <Button variant="outline">إلغاء</Button>
                    <Button>تغيير كلمة المرور</Button>
                  </div>
                  
                  <div className="pt-6 border-t">
                    <h3 className="font-medium mb-4">خيارات أمان إضافية</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">المصادقة الثنائية</h4>
                          <p className="text-sm text-muted-foreground">تفعيل المصادقة الثنائية لحسابك</p>
                        </div>
                        <Button variant="outline" size="sm">تفعيل</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">سجل تسجيل الدخول</h4>
                          <p className="text-sm text-muted-foreground">عرض سجل محاولات تسجيل الدخول</p>
                        </div>
                        <Button variant="outline" size="sm">عرض السجل</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </MainLayout>
  );
};

export default Settings;
