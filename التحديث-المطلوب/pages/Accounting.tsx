import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Banknote, Search, Plus, DollarSign, Filter } from 'lucide-react';
import { AddExpenseDialog } from '@/components/Accounting/AddExpenseDialog';
import { SearchBar } from '@/components/Inventory/SearchBar';

const mockTransactions = [
  { id: '1', transaction_type: 'deposit', amount: 1000, delegate: { name: 'محمد عبد الله' }, description: 'توريد نقدي', created_at: '2025-07-01' },
  { id: '2', transaction_type: 'expense', amount: 200, delegate: { name: 'سعيد علي' }, description: 'مصاريف نقل', created_at: '2025-07-02' },
  { id: '3', transaction_type: 'deposit', amount: 500, delegate: { name: 'خالد حسن' }, description: 'توريد نقدي', created_at: '2025-07-02' },
];

const Accounting = () => {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState(mockTransactions);

  const filteredTransactions = transactions.filter(transaction =>
    (transaction.description && transaction.description.includes(searchTerm)) ||
    (transaction.delegate?.name && transaction.delegate.name.includes(searchTerm))
  );

  const totalDeposits = transactions
    .filter(t => t.transaction_type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const cashBalance = totalDeposits - totalExpenses;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddExpense = (data) => {
    setTransactions(transactions => [
      ...transactions,
      {
        id: (transactions.length + 1).toString(),
        transaction_type: 'expense',
        amount: data.amount,
        delegate: { name: 'غير محدد' },
        description: data.description,
        created_at: new Date().toISOString()
      }
    ]);
    setIsAddExpenseOpen(false);
  };

  return (
    <MainLayout title="النقدية">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <Plus size={16} />
            تسجيل مصروف
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={18} className="text-blue-600" />
              <span>إجمالي التوريدات</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{totalDeposits} جم</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={18} className="text-red-600" />
              <span>إجمالي المصروفات</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{totalExpenses} جم</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Banknote size={18} className="text-green-600" />
              <span>الرصيد النقدي</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{cashBalance} جم</p>
          </CardContent>
        </Card>
      </div>
      <Card className="paper-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote size={18} />
            سجل المعاملات النقدية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-right">نوع المعاملة</th>
                  <th className="px-4 py-3 text-right">المبلغ (جم)</th>
                  <th className="px-4 py-3 text-right">المندوب</th>
                  <th className="px-4 py-3 text-right">الوصف</th>
                  <th className="px-4 py-3 text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      لا يوجد معاملات نقدية مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        {transaction.transaction_type === 'deposit' ? (
                          <span className="text-blue-600">توريد</span>
                        ) : (
                          <span className="text-red-600">مصروف</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{transaction.amount} جم</td>
                      <td className="px-4 py-3">{transaction.delegate?.name || '-'}</td>
                      <td className="px-4 py-3">{transaction.description || '-'}</td>
                      <td className="px-4 py-3">{new Date(transaction.created_at).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {isAddExpenseOpen && (
        <AddExpenseDialog
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          onSubmit={handleAddExpense}
        />
      )}
    </MainLayout>
  );
};

export default Accounting;
