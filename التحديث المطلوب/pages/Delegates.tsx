import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Plus, FileDown, FileUp } from 'lucide-react';
import { AddDelegateDialog } from '@/components/Delegates/AddDelegateDialog';
import { DelegateDetailsDialog } from '@/components/Delegates/DelegateDetailsDialog';

const mockDelegates = [
  { id: '1', name: 'محمد عبد الله', phone: '0500000001', route: 'الرياض', balance: 500, created_at: '2025-07-01' },
  { id: '2', name: 'سعيد علي', phone: '0500000002', route: 'جدة', balance: 300, created_at: '2025-07-02' },
  { id: '3', name: 'خالد حسن', phone: '0500000003', route: 'الدمام', balance: 200, created_at: '2025-07-02' },
];

const Delegates = () => {
  const [isAddDelegateOpen, setIsAddDelegateOpen] = useState(false);
  const [selectedDelegate, setSelectedDelegate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [delegates, setDelegates] = useState(mockDelegates);

  const filteredDelegates = delegates.filter(delegate =>
    delegate.name.includes(searchTerm) ||
    (delegate.phone && delegate.phone.includes(searchTerm))
  );

  const handleViewDelegate = (delegate) => {
    setSelectedDelegate(delegate);
  };

  const closeDetailsDialog = () => {
    setSelectedDelegate(null);
  };

  return (
    <MainLayout title="إدارة المناديب">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="البحث عن المناديب..."
            className="pr-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FileDown size={16} />
            تصدير
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FileUp size={16} />
            استيراد
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsAddDelegateOpen(true)}
          >
            <Plus size={16} />
            مندوب جديد
          </Button>
        </div>
      </div>
      <Card className="paper-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={18} />
            بيانات المناديب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-right">اسم المندوب</th>
                  <th className="px-4 py-3 text-right">رقم الهاتف</th>
                  <th className="px-4 py-3 text-right">خط السير</th>
                  <th className="px-4 py-3 text-right">الرصيد (جم)</th>
                  <th className="px-4 py-3 text-right">تاريخ التسجيل</th>
                  <th className="px-4 py-3 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDelegates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      لا يوجد مناديب مطابقين للبحث
                    </td>
                  </tr>
                ) : (
                  filteredDelegates.map((delegate) => (
                    <tr key={delegate.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">{delegate.name}</td>
                      <td className="px-4 py-3">{delegate.phone || '-'}</td>
                      <td className="px-4 py-3">{delegate.route || '-'}</td>
                      <td className="px-4 py-3">{delegate.balance} جم</td>
                      <td className="px-4 py-3">{new Date(delegate.created_at).toLocaleDateString('ar-EG')}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDelegate(delegate)}
                          >
                            عرض التفاصيل
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {isAddDelegateOpen && (
        <AddDelegateDialog
          isOpen={isAddDelegateOpen}
          onClose={() => setIsAddDelegateOpen(false)}
          onSubmit={data => {
            setDelegates(delegates => [
              ...delegates,
              {
                id: (delegates.length + 1).toString(),
                name: data.name,
                phone: data.phone || '',
                route: data.route || '',
                balance: 0,
                created_at: new Date().toISOString()
              }
            ]);
            setIsAddDelegateOpen(false);
          }}
        />
      )}
      {selectedDelegate && (
        <DelegateDetailsDialog
          delegate={selectedDelegate}
          isOpen={!!selectedDelegate}
          onClose={closeDetailsDialog}
        />
      )}
    </MainLayout>
  );
};

export default Delegates;
