
import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileDown, User, Phone, MapPin } from 'lucide-react';

// بيانات العملاء النموذجية
const clientsData = [
  {
    id: 1,
    name: "سوبر ماركت الفتح",
    contact: "محمد أحمد",
    phone: "0512345678",
    location: "الرياض - حي النخيل",
    balance: 2500.50,
    status: "نشط"
  },
  {
    id: 2,
    name: "مطعم الشرق",
    contact: "أحمد علي",
    phone: "0523456789",
    location: "الرياض - حي العليا",
    balance: 1800.75,
    status: "نشط"
  },
  {
    id: 3,
    name: "محلات النعيم",
    contact: "خالد عمر",
    phone: "0534567890",
    location: "الرياض - حي الملز",
    balance: 0,
    status: "نشط"
  },
  {
    id: 4,
    name: "شركة الروابي",
    contact: "سعد ناصر",
    phone: "0545678901",
    location: "الرياض - حي الورود",
    balance: 3200.25,
    status: "نشط"
  },
  {
    id: 5,
    name: "سوبر ماركت البركة",
    contact: "عبدالله محمد",
    phone: "0556789012",
    location: "الرياض - حي المروج",
    balance: 950.30,
    status: "متأخر"
  }
];

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <MainLayout title="العملاء">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="البحث عن العملاء..."
            className="pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FileDown size={16} />
            تصدير
          </Button>
          <Button size="sm" className="flex items-center gap-1">
            <Plus size={16} />
            عميل جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="paper-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">العملاء النشطون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        
        <Card className="paper-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستحقات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,450.80 ريال</div>
          </CardContent>
        </Card>
        
        <Card className="paper-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250.50 ريال</div>
          </CardContent>
        </Card>
      </div>

      <Card className="paper-card">
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-right">اسم العميل</th>
                  <th className="px-4 py-3 text-right">جهة الاتصال</th>
                  <th className="px-4 py-3 text-right">رقم الهاتف</th>
                  <th className="px-4 py-3 text-right">الموقع</th>
                  <th className="px-4 py-3 text-right">الرصيد</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientsData.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{client.name}</td>
                    <td className="px-4 py-3">{client.contact}</td>
                    <td className="px-4 py-3">{client.phone}</td>
                    <td className="px-4 py-3">{client.location}</td>
                    <td className="px-4 py-3">{client.balance.toFixed(2)} ريال</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        client.status === "نشط" ? "bg-green-100 text-green-800" : 
                        "bg-red-100 text-red-800"
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">عرض الملف</Button>
                        <Button variant="outline" size="sm">كشف حساب</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              عرض 5 من 24 عميل
            </div>
            <div className="space-x-1">
              <Button variant="outline" size="sm">السابق</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">التالي</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="paper-card">
          <CardHeader>
            <CardTitle>العملاء الجدد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b pb-3">
                <div className="bg-dairy-100 p-3 rounded-full">
                  <User className="h-5 w-5 text-dairy-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">مطعم الشرق</p>
                  <div className="flex text-sm text-muted-foreground gap-3 mt-1">
                    <span className="flex items-center">
                      <Phone className="h-3 w-3 ml-1" />
                      0523456789
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 ml-1" />
                      الرياض
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">عرض</Button>
              </div>
              <div className="flex items-center gap-3 border-b pb-3">
                <div className="bg-dairy-100 p-3 rounded-full">
                  <User className="h-5 w-5 text-dairy-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">محلات النعيم</p>
                  <div className="flex text-sm text-muted-foreground gap-3 mt-1">
                    <span className="flex items-center">
                      <Phone className="h-3 w-3 ml-1" />
                      0534567890
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 ml-1" />
                      الرياض
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">عرض</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="paper-card">
          <CardHeader>
            <CardTitle>المدفوعات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2 flex justify-between">
                <div>
                  <p className="font-medium">سوبر ماركت الفتح</p>
                  <p className="text-sm text-muted-foreground">دفع جزئي</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+ 1000.00 ريال</p>
                  <p className="text-sm text-muted-foreground">5 أبريل، 2025</p>
                </div>
              </div>
              <div className="border-b pb-2 flex justify-between">
                <div>
                  <p className="font-medium">محلات النعيم</p>
                  <p className="text-sm text-muted-foreground">تسوية كاملة</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+ 1540.25 ريال</p>
                  <p className="text-sm text-muted-foreground">4 أبريل، 2025</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Clients;
