
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getDelegate, 
  getDelegateMovements, 
  getDelegateCashTransactions,
  addDelegateMovement,
  addCashTransaction,
  updateDelegateBalance
} from '@/services/delegateService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Receipt, DollarSign, Package, ArrowLeft } from 'lucide-react';
import { AddSaleDialog } from '@/components/Delegates/AddSaleDialog';
import { AddDelegateExpenseDialog } from '@/components/Delegates/AddDelegateExpenseDialog';

const DelegatePortal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // التحقق من وجود معرف المندوب
  if (!id) {
    navigate('/delegates');
    return null;
  }

  // استعلام بيانات المندوب
  const { data: delegate, isLoading: isDelegateLoading } = useQuery({
    queryKey: ['delegate', id],
    queryFn: () => getDelegate(id),
  });

  // استعلام حركات المخزون للمندوب
  const { data: movements = [], isLoading: isMovementsLoading } = useQuery({
    queryKey: ['delegateMovements', id],
    queryFn: () => getDelegateMovements(id),
  });

  // استعلام المعاملات النقدية للمندوب
  const { data: transactions = [], isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['delegateTransactions', id],
    queryFn: () => getDelegateCashTransactions(id),
  });

  // إضافة فاتورة مبيعات جديدة
  const addSaleMutation = useMutation({
    mutationFn: addDelegateMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegateMovements', id] });
      queryClient.invalidateQueries({ queryKey: ['delegate', id] });
      toast({
        title: "تم تسجيل فاتورة المبيعات بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "فشل تسجيل فاتورة المبيعات",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // إضافة مصروف جديد
  const addExpenseMutation = useMutation({
    mutationFn: addCashTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegateTransactions', id] });
      queryClient.invalidateQueries({ queryKey: ['delegate', id] });
      toast({
        title: "تم تسجيل المصروف بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "فشل تسجيل المصروف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // التعامل مع إضافة فاتورة مبيعات
  const handleAddSale = (data: any) => {
    if (!id) return;
    
    addSaleMutation.mutate({
      delegate_id: id,
      product_id: data.product_id,
      quantity: data.quantity,
      total_price: data.total_price,
      movement_type: 'sale',
      notes: data.notes || `بيع منتج لعميل: ${data.customer_name}`
    });

    setIsAddSaleOpen(false);
  };

  // التعامل مع إضافة مصروف
  const handleAddExpense = (data: any) => {
    if (!id) return;
    
    addExpenseMutation.mutate({
      delegate_id: id,
      amount: data.amount,
      transaction_type: 'expense',
      description: data.description
    });

    setIsAddExpenseOpen(false);
  };

  // العودة إلى صفحة المناديب
  const handleBack = () => {
    navigate('/delegates');
  };

  if (isDelegateLoading) {
    return (
      <MainLayout title="بوابة المندوب">
        <div className="text-center p-8">جاري تحميل بيانات المندوب...</div>
      </MainLayout>
    );
  }

  if (!delegate) {
    return (
      <MainLayout title="بوابة المندوب">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-medium">لم يتم العثور على المندوب</h3>
          <Button onClick={handleBack} className="mt-4">
            العودة إلى المناديب
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`بوابة المندوب: ${delegate.name}`}>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-1">
          <ArrowLeft size={16} />
          العودة إلى المناديب
        </Button>
      </div>

      {/* بطاقة معلومات المندوب */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-blue-800 text-lg font-semibold">اسم المندوب</h3>
              <p className="mt-2">{delegate.name}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="text-green-800 text-lg font-semibold">رصيد المندوب</h3>
              <p className="mt-2">{delegate.balance} جم</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="text-purple-800 text-lg font-semibold">خط السير</h3>
              <p className="mt-2">{delegate.route || 'غير محدد'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* أزرار الإجراءات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button 
          onClick={() => setIsAddSaleOpen(true)}
          className="py-6 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <ShoppingCart size={20} />
          تسجيل فاتورة مبيعات جديدة
        </Button>
        <Button 
          onClick={() => setIsAddExpenseOpen(true)}
          className="py-6 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700"
        >
          <DollarSign size={20} />
          تسجيل مصروف جديد
        </Button>
      </div>

      {/* علامات تبويب للبيانات */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="sales" className="flex-1">
            <ShoppingCart className="mr-2 h-4 w-4" />
            فواتير المبيعات
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex-1">
            <DollarSign className="mr-2 h-4 w-4" />
            المصروفات
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex-1">
            <Package className="mr-2 h-4 w-4" />
            مخزون المندوب
          </TabsTrigger>
        </TabsList>

        {/* محتوى علامات التبويب */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart size={18} />
                فواتير المبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isMovementsLoading ? (
                <div className="text-center p-4">جاري تحميل البيانات...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-right">رقم الفاتورة</th>
                        <th className="px-4 py-3 text-right">المنتج</th>
                        <th className="px-4 py-3 text-right">الكمية</th>
                        <th className="px-4 py-3 text-right">السعر الإجمالي</th>
                        <th className="px-4 py-3 text-right">التاريخ</th>
                        <th className="px-4 py-3 text-right">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {movements.filter(m => m.movement_type === 'sale').length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                            لا توجد فواتير مبيعات مسجلة
                          </td>
                        </tr>
                      ) : (
                        movements
                          .filter(m => m.movement_type === 'sale')
                          .map((sale) => (
                            <tr key={sale.id} className="hover:bg-muted/50">
                              <td className="px-4 py-3">{sale.id.substring(0, 8)}</td>
                              <td className="px-4 py-3">{sale.product?.name || 'منتج غير معروف'}</td>
                              <td className="px-4 py-3">{sale.quantity}</td>
                              <td className="px-4 py-3">{sale.total_price} جم</td>
                              <td className="px-4 py-3">{new Date(sale.created_at).toLocaleDateString('ar-EG')}</td>
                              <td className="px-4 py-3">{sale.notes || '-'}</td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={18} />
                المصروفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading ? (
                <div className="text-center p-4">جاري تحميل البيانات...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-right">المبلغ</th>
                        <th className="px-4 py-3 text-right">الوصف</th>
                        <th className="px-4 py-3 text-right">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.filter(t => t.transaction_type === 'expense').length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                            لا توجد مصروفات مسجلة
                          </td>
                        </tr>
                      ) : (
                        transactions
                          .filter(t => t.transaction_type === 'expense')
                          .map((expense) => (
                            <tr key={expense.id} className="hover:bg-muted/50">
                              <td className="px-4 py-3">{expense.amount} جم</td>
                              <td className="px-4 py-3">{expense.description || '-'}</td>
                              <td className="px-4 py-3">{new Date(expense.created_at).toLocaleDateString('ar-EG')}</td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={18} />
                مخزون المندوب
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isMovementsLoading ? (
                <div className="text-center p-4">جاري تحميل البيانات...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-right">المنتج</th>
                        <th className="px-4 py-3 text-right">الكمية المسحوبة</th>
                        <th className="px-4 py-3 text-right">الكمية المباعة</th>
                        <th className="px-4 py-3 text-right">الكمية المتبقية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        // تجميع المنتجات وحساب الكميات
                        const inventory: Record<string, { 
                          productName: string, 
                          withdrawn: number, 
                          sold: number,
                          returned: number 
                        }> = {};
                        
                        movements.forEach(m => {
                          if (!m.product_id || !m.product) return;
                          
                          if (!inventory[m.product_id]) {
                            inventory[m.product_id] = {
                              productName: m.product.name,
                              withdrawn: 0,
                              sold: 0,
                              returned: 0
                            };
                          }
                          
                          if (m.movement_type === 'withdraw') {
                            inventory[m.product_id].withdrawn += m.quantity;
                          } else if (m.movement_type === 'sale') {
                            inventory[m.product_id].sold += m.quantity;
                          } else if (m.movement_type === 'return') {
                            inventory[m.product_id].returned += m.quantity;
                          }
                        });
                        
                        const items = Object.values(inventory);
                        
                        return items.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                              لا توجد منتجات في مخزون المندوب
                            </td>
                          </tr>
                        ) : (
                          items.map((item, index) => (
                            <tr key={index} className="hover:bg-muted/50">
                              <td className="px-4 py-3">{item.productName}</td>
                              <td className="px-4 py-3">{item.withdrawn}</td>
                              <td className="px-4 py-3">{item.sold}</td>
                              <td className="px-4 py-3">{item.withdrawn - item.sold - item.returned}</td>
                            </tr>
                          ))
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* نافذة إضافة فاتورة مبيعات */}
      <AddSaleDialog
        isOpen={isAddSaleOpen}
        onClose={() => setIsAddSaleOpen(false)}
        onSubmit={handleAddSale}
        delegateId={id}
      />

      {/* نافذة إضافة مصروف */}
      <AddDelegateExpenseDialog
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSubmit={handleAddExpense}
      />
    </MainLayout>
  );
};

export default DelegatePortal;
