
import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileDown, AlertTriangle } from 'lucide-react';

// بيانات المرتجعات النموذجية
const returnsData = [
  {
    id: 1,
    date: "2025-04-05",
    productName: "حليب كامل الدسم",
    productCode: "MLK-001",
    quantity: 20,
    client: "سوبر ماركت الفتح",
    reason: "قرب انتهاء الصلاحية",
    status: "معتمدة",
    action: "إعادة للمخزون"
  },
  {
    id: 2,
    date: "2025-04-04",
    productName: "زبادي",
    productCode: "YGT-001",
    quantity: 15,
    client: "مطعم الشرق",
    reason: "عبوات تالفة",
    status: "معتمدة",
    action: "إتلاف"
  },
  {
    id: 3,
    date: "2025-04-03",
    productName: "جبن أبيض",
    productCode: "CHS-001",
    quantity: 5,
    client: "محلات النعيم",
    reason: "خطأ في الطلب",
    status: "معلقة",
    action: "معلق"
  },
  {
    id: 4,
    date: "2025-04-03",
    productName: "قشدة",
    productCode: "CRM-001",
    quantity: 10,
    client: "سوبر ماركت البركة",
    reason: "انتهاء الصلاحية",
    status: "معتمدة",
    action: "إتلاف"
  }
];

const Returns = () => {
  return (
    <MainLayout title="المرتجعات">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="البحث في المرتجعات..."
            className="pr-8"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FileDown size={16} />
            تصدير
          </Button>
          <Button size="sm" className="flex items-center gap-1">
            <Plus size={16} />
            تسجيل مرتجع
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="paper-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المرتجعات (الشهر الحالي)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50 وحدة</div>
            <p className="text-xs text-muted-foreground">قيمة تقريبية: 2,500 ريال</p>
          </CardContent>
        </Card>
        
        <Card className="paper-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">نسبة المرتجعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5%</div>
            <p className="text-xs text-muted-foreground">من إجمالي المبيعات</p>
          </CardContent>
        </Card>
        
        <Card className="paper-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">مرتجعات معلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">بانتظار المراجعة</p>
          </CardContent>
        </Card>
      </div>

      <Card className="paper-card">
        <CardHeader>
          <CardTitle>سجل المرتجعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-right">التاريخ</th>
                  <th className="px-4 py-3 text-right">المنتج</th>
                  <th className="px-4 py-3 text-right">الكمية</th>
                  <th className="px-4 py-3 text-right">العميل</th>
                  <th className="px-4 py-3 text-right">سبب الإرجاع</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">الإجراء المتخذ</th>
                  <th className="px-4 py-3 text-right">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {returnsData.map((returnItem) => (
                  <tr key={returnItem.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{returnItem.date}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p>{returnItem.productName}</p>
                        <p className="text-xs text-muted-foreground">{returnItem.productCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{returnItem.quantity} وحدة</td>
                    <td className="px-4 py-3">{returnItem.client}</td>
                    <td className="px-4 py-3">{returnItem.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        returnItem.status === "معتمدة" ? "bg-green-100 text-green-800" : 
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {returnItem.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {returnItem.action === "إتلاف" ? (
                        <span className="flex items-center text-red-600">
                          <AlertTriangle size={14} className="ml-1" />
                          {returnItem.action}
                        </span>
                      ) : (
                        returnItem.action
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm">عرض التفاصيل</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="paper-card">
          <CardHeader>
            <CardTitle>أسباب المرتجعات الشائعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-3">
                <div className="flex justify-between mb-2">
                  <span>قرب انتهاء الصلاحية</span>
                  <span className="font-medium">40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-dairy-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div className="border-b pb-3">
                <div className="flex justify-between mb-2">
                  <span>عبوات تالفة</span>
                  <span className="font-medium">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-dairy-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="border-b pb-3">
                <div className="flex justify-between mb-2">
                  <span>خطأ في الطلب</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-dairy-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>أسباب أخرى</span>
                  <span className="font-medium">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-dairy-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="paper-card">
          <CardHeader>
            <CardTitle>المرتجعات المعلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex-1">
                  <p className="font-medium">جبن أبيض (CHS-001)</p>
                  <p className="text-sm text-yellow-700">
                    5 وحدات من محلات النعيم - بانتظار المراجعة
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">3 أبريل، 2025</p>
                </div>
                <div>
                  <Button size="sm" className="mb-1 w-full">قبول</Button>
                  <Button size="sm" variant="outline" className="w-full">رفض</Button>
                </div>
              </div>
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex-1">
                  <p className="font-medium">حليب قليل الدسم (MLK-002)</p>
                  <p className="text-sm text-yellow-700">
                    10 وحدات من سوبر ماركت الفتح - بانتظار المراجعة
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">2 أبريل، 2025</p>
                </div>
                <div>
                  <Button size="sm" className="mb-1 w-full">قبول</Button>
                  <Button size="sm" variant="outline" className="w-full">رفض</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Returns;
