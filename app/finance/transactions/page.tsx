'use client';

import React, { useEffect, useState } from 'react';
import { FaMoneyBillWave, FaShoppingCart, FaReceipt } from 'react-icons/fa';
import Calendar from '@/components/Calendar';
import dayjs from 'dayjs';
import PasswordPrompt from '@/components/PasswordPrompt';
import ExportButton from '@/components/ExportButton';

// تعريف أنواع البيانات
interface Product {
  _id: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  weight?: string;
}

interface FinancialTransaction {
  _id: string;
  type: 'expense' | 'income' | 'purchase';
  amount: number;
  category: string;
  description?: string;
  party?: string;
  date: string;
  invoiceNumber?: string;
  productId?: string; // تغيير من Product إلى string
  quantity?: number;
  isRecurring: boolean;
  createdAt: string;
}

// تصنيفات المصروفات والإيرادات
const expenseCategories = [
  'إيجار',
  'رواتب',
  'مرافق',
  'نقل',
  'تسويق',
  'صيانة',
  'مستلزمات',
  'أخرى'
];

const incomeCategories = [
  'مبيعات',
  'استثمارات',
  'إيرادات أخرى'
];

export default function FinancialTransactionsPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'income' | 'purchase'>('expense');
  const [formData, setFormData] = useState<Partial<FinancialTransaction>>({
    date: selectedDate,
    type: 'expense',
    amount: 0,
    category: '',
    description: '',
    party: '',
    invoiceNumber: '',
    isRecurring: false
  });
  const [filterType, setFilterType] = useState<string>('all');
  
  // جلب المعاملات المالية
  useEffect(() => {
    if (isAuthorized) {
      fetchTransactions();
    }
  }, [selectedDate, isAuthorized, filterType]);
  
  // جلب المنتجات
  useEffect(() => {
    if (isAuthorized) {
      fetch('/api/inventory')
        .then(res => res.json())
        .then(setProducts);
    }
  }, [isAuthorized]);
  
  // تحديث تاريخ النموذج عند تغيير التاريخ المحدد
  useEffect(() => {
    setFormData(prev => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);
  
  const fetchTransactions = async () => {
    let url = `/api/finance/transactions?date=${selectedDate}`;
    if (filterType !== 'all') {
      url += `&type=${filterType}`;
    }
    
    const res = await fetch(url);
    const data = await res.json();
    setTransactions(data);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: modalType,
          date: selectedDate
        }),
      });
      
      if (response.ok) {
        // إعادة تعيين النموذج وإغلاق النافذة المنبثقة
        setFormData({
          date: selectedDate,
          type: modalType,
          amount: 0,
          category: '',
          description: '',
          party: '',
          invoiceNumber: '',
          isRecurring: false
        });
        setShowModal(false);
        fetchTransactions();
      } else {
        const error = await response.json();
        alert(`خطأ: ${error.message}`);
      }
    } catch (error) {
      console.error('خطأ في إرسال النموذج:', error);
      alert('حدث خطأ أثناء معالجة الطلب');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المعاملة؟')) return;
    
    try {
      const response = await fetch(`/api/finance/transactions?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchTransactions();
      } else {
        const error = await response.json();
        alert(`خطأ: ${error.message}`);
      }
    } catch (error) {
      console.error('خطأ في حذف المعاملة:', error);
      alert('حدث خطأ أثناء معالجة الطلب');
    }
  };
  
  const openModal = (type: 'expense' | 'income' | 'purchase') => {
    setModalType(type);
    setFormData({
      date: selectedDate,
      type,
      amount: 0,
      category: '',
      description: '',
      party: '',
      invoiceNumber: '',
      isRecurring: false,
      ...(type === 'purchase' ? { productId: '', quantity: 1 } : {})
    });
    setShowModal(true);
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'expense': return 'مصروف';
      case 'income': return 'إيراد';
      case 'purchase': return 'مشتريات';
      default: return type;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'expense': return 'text-red-500';
      case 'income': return 'text-green-500';
      case 'purchase': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'expense': return <FaMoneyBillWave className="text-red-500" />;
      case 'income': return <FaReceipt className="text-green-500" />;
      case 'purchase': return <FaShoppingCart className="text-blue-500" />;
      default: return null;
    }
  };
  
  // حساب إجماليات المعاملات
  const calculateTotals = () => {
    let totalExpenses = 0;
    let totalIncome = 0;
    let totalPurchases = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        totalExpenses += transaction.amount;
      } else if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else if (transaction.type === 'purchase') {
        totalPurchases += transaction.amount;
      }
    });
    
    return { totalExpenses, totalIncome, totalPurchases };
  };
  
  const { totalExpenses, totalIncome, totalPurchases } = calculateTotals();
  
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-white mb-8">المعاملات المالية</h1>
          <PasswordPrompt 
            onSuccess={() => setIsAuthorized(true)}
            label="أدخل كلمة المرور للوصول إلى المعاملات المالية"
            buttonText="تأكيد"
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 drop-shadow-lg tracking-wide font-cairo">
            المعاملات المالية
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium font-cairo">
            إدارة المصروفات والإيرادات والمشتريات
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">التاريخ</h2>
            <Calendar selectedDate={selectedDate} onChange={setSelectedDate} />
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-white">ملخص اليوم</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">المصروفات</p>
                <p className="text-2xl font-bold text-red-500">{totalExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">الإيرادات</p>
                <p className="text-2xl font-bold text-green-500">{totalIncome.toFixed(2)}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">المشتريات</p>
                <p className="text-2xl font-bold text-blue-500">{totalPurchases.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={() => openModal('expense')} 
            className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
          >
            <FaMoneyBillWave size={20} />
            <span className="text-lg font-semibold">إضافة مصروف</span>
          </button>
          <button 
            onClick={() => openModal('income')} 
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
          >
            <FaReceipt size={20} />
            <span className="text-lg font-semibold">إضافة إيراد</span>
          </button>
          <button 
            onClick={() => openModal('purchase')} 
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
          >
            <FaShoppingCart size={20} />
            <span className="text-lg font-semibold">تسجيل مشتريات</span>
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="p-4 bg-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">المعاملات</h2>
            <div className="flex gap-4">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
              >
                <option value="all">جميع المعاملات</option>
                <option value="expense">المصروفات</option>
                <option value="income">الإيرادات</option>
                <option value="purchase">المشتريات</option>
              </select>
              <ExportButton 
                data={transactions} 
                fileName={`financial-transactions-${selectedDate}`} 
                label="تصدير"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-6 py-3">النوع</th>
                  <th className="px-6 py-3">التصنيف</th>
                  <th className="px-6 py-3">المبلغ</th>
                  <th className="px-6 py-3">الوصف</th>
                  <th className="px-6 py-3">الجهة</th>
                  <th className="px-6 py-3">رقم الفاتورة</th>
                  <th className="px-6 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr className="bg-gray-800 border-b border-gray-700">
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                      لا توجد معاملات لهذا اليوم
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction._id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                      <td className="px-6 py-4 flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className={getTypeColor(transaction.type)}>
                          {getTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">{transaction.category}</td>
                      <td className="px-6 py-4 font-semibold">{transaction.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">{transaction.description || '-'}</td>
                      <td className="px-6 py-4">{transaction.party || '-'}</td>
                      <td className="px-6 py-4">{transaction.invoiceNumber || '-'}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* نافذة إضافة معاملة جديدة */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 modal-content">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
              <h3 className="text-xl font-semibold text-white">
                {modalType === 'expense' && 'إضافة مصروف جديد'}
                {modalType === 'income' && 'إضافة إيراد جديد'}
                {modalType === 'purchase' && 'تسجيل عملية شراء'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* حقول مشتركة */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">المبلغ</label>
                  <input 
                    type="number" 
                    name="amount" 
                    value={formData.amount} 
                    onChange={handleInputChange} 
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" 
                    required 
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">التصنيف</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" 
                    required
                  >
                    <option value="">اختر التصنيف</option>
                    {modalType === 'expense' && expenseCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    {modalType === 'income' && incomeCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    {modalType === 'purchase' && <option value="مشتريات">مشتريات</option>}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">الوصف</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" 
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">الجهة</label>
                  <input 
                    type="text" 
                    name="party" 
                    value={formData.party} 
                    onChange={handleInputChange} 
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" 
                    placeholder={modalType === 'purchase' ? 'المورد' : modalType === 'expense' ? 'المستفيد' : 'المصدر'}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">رقم الفاتورة</label>
                  <input 
                    type="text" 
                    name="invoiceNumber" 
                    value={formData.invoiceNumber} 
                    onChange={handleInputChange} 
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" 
                  />
                </div>
                
                {/* حقول خاصة بالمشتريات */}
                {modalType === 'purchase' && (
                  <>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">المنتج</label>
                      <select 
                        name="productId" 
                        value={formData.productId} 
                        onChange={handleInputChange} 
                        className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" 
                        required
                      >
                        <option value="">اختر المنتج</option>
                        {products.map(product => (
                          <option key={product._id} value={product._id}>{product.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">الكمية</label>
                      <input 
                        type="number" 
                        name="quantity" 
                        value={formData.quantity} 
                        onChange={handleInputChange} 
                        className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" 
                        required 
                        min="1"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="isRecurring" 
                    checked={formData.isRecurring} 
                    onChange={handleInputChange} 
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600" 
                  />
                  <label className="mr-2 text-sm font-medium text-gray-300">معاملة متكررة</label>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-700">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}