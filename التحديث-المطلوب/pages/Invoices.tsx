
import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileDown, Printer, Eye } from 'lucide-react';

// بيانات الفواتير النموذجية
const invoiceData = [
  {
    id: "A-2025-123",
    client: "سوبر ماركت الفتح",
    date: "2025-04-04",
    total: 1250.75,
    status: "مدفوعة"
  },
  {
    id: "A-2025-124",
    client: "مطعم الشرق",
    date: "2025-04-05",
    total: 875.50,
    status: "معلقة"
  },
  {
    id: "A-2025-125",
    client: "محلات النعيم",
    date: "2025-04-05",
    total: 1540.25,
    status: "مدفوعة"
  },
  {
    id: "A-2025-126",
    client: "شركة الروابي",
    date: "2025-04-06",
    total: 2180.00,
    status: "معلقة"
  },
  {
    id: "A-2025-127",
    client: "سوبر ماركت البركة",
    date: "2025-04-07",
    total: 950.30,
    status: "متأخرة"
  }
];

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <MainLayout title="الفواتير">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="البحث عن الفواتير..."
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
            إنشاء فاتورة
          </Button>
        </div>
      </div>

      <Card className="paper-card">
        <CardHeader>
          <CardTitle>الفواتير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-right">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-right">العميل</th>
                  <th className="px-4 py-3 text-right">التاريخ</th>
                  <th className="px-4 py-3 text-right">المبلغ</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoiceData.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{invoice.id}</td>
                    <td className="px-4 py-3">{invoice.client}</td>
                    <td className="px-4 py-3">{invoice.date}</td>
                    <td className="px-4 py-3">{invoice.total.toFixed(2)} ريال</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invoice.status === "مدفوعة" ? "bg-green-100 text-green-800" :
                        invoice.status === "معلقة" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center">
                          <Eye size={14} className="ml-1" />
                          عرض
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <Printer size={14} className="ml-1" />
                          طباعة
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              عرض 5 من 25 فاتورة
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
            <CardTitle>أحدث المدفوعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2 flex justify-between">
                <div>
                  <p className="font-medium">سوبر ماركت الفتح</p>
                  <p className="text-sm text-muted-foreground">فاتورة رقم: A-2025-123</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+ 1250.75 ريال</p>
                  <p className="text-sm text-muted-foreground">4 أبريل، 2025</p>
                </div>
              </div>
              <div className="border-b pb-2 flex justify-between">
                <div>
                  <p className="font-medium">محلات النعيم</p>
                  <p className="text-sm text-muted-foreground">فاتورة رقم: A-2025-125</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+ 1540.25 ريال</p>
                  <p className="text-sm text-muted-foreground">5 أبريل، 2025</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="paper-card">
          <CardHeader>
            <CardTitle>الفواتير المتأخرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded">
                <div className="flex-1">
                  <p className="font-medium">سوبر ماركت البركة</p>
                  <p className="text-sm text-red-700">متأخرة 7 أيام - 950.30 ريال</p>
                </div>
                <Button size="sm">تذكير</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Invoices;
