
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TabsList, Tabs, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShoppingCart, ArrowLeftRight, DollarSign, User, Package, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Delegate,
  getDelegateMovements,
  getDelegateCashTransactions,
  addDelegateMovement,
  updateDelegateBalance,
  addCashTransaction
} from '@/services/delegateService';
import { Card } from '@/components/ui/card';
import { WithdrawProductDialog } from './WithdrawProductDialog';
import { ReturnProductDialog } from './ReturnProductDialog';
import { DepositMoneyDialog } from './DepositMoneyDialog';

interface DelegateDetailsDialogProps {
  delegate: Delegate;
  isOpen: boolean;
  onClose: () => void;
}

export function DelegateDetailsDialog({ delegate, isOpen, onClose }: DelegateDetailsDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);

  // استعلام حركات المخزون للمندوب
  const { data: movements = [] } = useQuery({
    queryKey: ['delegateMovements', delegate.id],
    queryFn: () => getDelegateMovements(delegate.id),
  });

  // استعلام المعاملات النقدية للمندوب
  const { data: transactions = [] } = useQuery({
    queryKey: ['delegateTransactions', delegate.id],
    queryFn: () => getDelegateCashTransactions(delegate.id),
  });

  // إضافة حركة مخزون للمندوب
  const addMovementMutation = useMutation({
    mutationFn: addDelegateMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegateMovements', delegate.id] });
      queryClient.invalidateQueries({ queryKey: ['delegates'] });
      toast({
        title: "تمت إضافة الحركة بنجاح",
      });
    },
  });

  // إضافة معاملة نقدية
  const addCashTransactionMutation = useMutation({
    mutationFn: addCashTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegateTransactions', delegate.id] });
      queryClient.invalidateQueries({ queryKey: ['delegates'] });
      queryClient.invalidateQueries({ queryKey: ['cash_transactions'] });
      toast({
        title: "تمت إضافة المعاملة النقدية بنجاح",
      });
    },
  });

  // تنفيذ عملية سحب منتج
  const handleWithdrawProduct = (data: any) => {
    const movement = {
      delegate_id: delegate.id,
      product_id: data.product_id,
      quantity: data.quantity,
      total_price: data.total_price,
      movement_type: 'withdraw',
      notes: data.notes
    };
    
    addMovementMutation.mutate(movement);
    setIsWithdrawDialogOpen(false);
  };

  // تنفيذ عملية إرجاع منتج
  const handleReturnProduct = (data: any) => {
    const movement = {
      delegate_id: delegate.id,
      product_id: data.product_id,
      quantity: data.quantity,
      total_price: data.total_price,
      movement_type: 'return',
      notes: data.notes
    };
    
    addMovementMutation.mutate(movement);
    setIsReturnDialogOpen(false);
  };

  // تنفيذ عملية توريد مبلغ
  const handleDepositMoney = (data: any) => {
    const transaction = {
      amount: data.amount,
      transaction_type: 'deposit',
      description: data.notes,
      delegate_id: delegate.id
    };
    
    addCashTransactionMutation.mutate(transaction);
    setIsDepositDialogOpen(false);
  };

  // الانتقال إلى صفحة بوابة المندوب
  const handleOpenDelegatePortal = () => {
    onClose();
    navigate(`/delegate/${delegate.id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <User size={20} />
            تفاصيل المندوب: {delegate.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">اسم المندوب</p>
            <p className="font-semibold">{delegate.name}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">رصيد المندوب</p>
            <p className="font-semibold">{delegate.balance} جنيه</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">خط السير</p>
            <p className="font-semibold">{delegate.route || 'غير محدد'}</p>
          </div>
        </div>

        <div className="my-6 grid grid-cols-1 md:grid-cols-4 gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsWithdrawDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <ArrowDownToLine size={16} />
            سحب منتج
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsReturnDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <ArrowUpFromLine size={16} />
            إرجاع منتج
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsDepositDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <DollarSign size={16} />
            توريد مبلغ
          </Button>
          <Button 
            onClick={handleOpenDelegatePortal}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
          >
            <User size={16} />
            بوابة المندوب
          </Button>
        </div>

        <Tabs defaultValue="inventory">
          <TabsList className="w-full">
            <TabsTrigger value="inventory" className="flex-1">
              <Package className="mr-2 h-4 w-4" />
              حركات المخزون
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              المعاملات المالية
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory" className="mt-4">
            <Card className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-right">المنتج</th>
                      <th className="px-3 py-2 text-right">الكمية</th>
                      <th className="px-3 py-2 text-right">السعر الإجمالي</th>
                      <th className="px-3 py-2 text-right">نوع الحركة</th>
                      <th className="px-3 py-2 text-right">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          لا توجد حركات مخزون
                        </td>
                      </tr>
                    ) : (
                      movements.map(movement => (
                        <tr key={movement.id} className="hover:bg-muted/50">
                          <td className="px-3 py-2">{movement.product?.name || '-'}</td>
                          <td className="px-3 py-2">{movement.quantity}</td>
                          <td className="px-3 py-2">{movement.total_price} جم</td>
                          <td className="px-3 py-2">
                            {movement.movement_type === 'withdraw' ? 'سحب' : 
                             movement.movement_type === 'return' ? 'إرجاع' : 
                             movement.movement_type === 'sale' ? 'بيع' : movement.movement_type}
                          </td>
                          <td className="px-3 py-2">{new Date(movement.created_at).toLocaleDateString('ar-EG')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-4">
            <Card className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-right">المبلغ</th>
                      <th className="px-3 py-2 text-right">نوع المعاملة</th>
                      <th className="px-3 py-2 text-right">الوصف</th>
                      <th className="px-3 py-2 text-right">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-gray-500">
                          لا توجد معاملات مالية
                        </td>
                      </tr>
                    ) : (
                      transactions.map(transaction => (
                        <tr key={transaction.id} className="hover:bg-muted/50">
                          <td className="px-3 py-2">{transaction.amount} جم</td>
                          <td className="px-3 py-2">
                            {transaction.transaction_type === 'deposit' ? 'توريد' : 
                             transaction.transaction_type === 'expense' ? 'مصروف' : transaction.transaction_type}
                          </td>
                          <td className="px-3 py-2">{transaction.description || '-'}</td>
                          <td className="px-3 py-2">{new Date(transaction.created_at).toLocaleDateString('ar-EG')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>

        {/* نافذة سحب منتج */}
        {isWithdrawDialogOpen && (
          <WithdrawProductDialog
            isOpen={isWithdrawDialogOpen}
            onClose={() => setIsWithdrawDialogOpen(false)}
            onSubmit={handleWithdrawProduct}
          />
        )}

        {/* نافذة إرجاع منتج */}
        {isReturnDialogOpen && (
          <ReturnProductDialog
            isOpen={isReturnDialogOpen}
            onClose={() => setIsReturnDialogOpen(false)}
            onSubmit={handleReturnProduct}
            delegateId={delegate.id}
          />
        )}

        {/* نافذة توريد مبلغ */}
        {isDepositDialogOpen && (
          <DepositMoneyDialog
            isOpen={isDepositDialogOpen}
            onClose={() => setIsDepositDialogOpen(false)}
            onSubmit={handleDepositMoney}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
