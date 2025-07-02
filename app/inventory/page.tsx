'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, Plus, FileDown, FileUp } from 'lucide-react';
import { mockDelegates } from '@/lib/data/delegates';
import { fetchProductsFromDB } from '@/lib/data/products';
import { addWithdrawalLog } from '@/lib/data/withdrawalsLog';
import { Dialog } from '@headlessui/react';
import { Product } from '@/lib/types';
import DelegateActivationDialog from '@/components/DelegateActivationDialog';

// دالة بسيطة لتوليد id عشوائي بدون مكتبة خارجية
function simpleId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', weight: '', purchase_price: '', price_selling: '', current_stock: '' });
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [step, setStep] = useState<'chooseDelegate' | 'chooseProducts' | null>(null);
  const [selectedDelegate, setSelectedDelegate] = useState<any>(null);
  const [withdrawItems, setWithdrawItems] = useState<{ productId: string; productName: string; quantity: number }[]>([]);

  useEffect(() => {
    fetchProductsFromDB().then(data => setProducts(data));
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.includes(searchTerm)
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.purchase_price || !newProduct.price_selling || !newProduct.current_stock) return;
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newProduct.name,
        weight: newProduct.weight ? Number(newProduct.weight) : undefined,
        purchase_price: Number(newProduct.purchase_price),
        price_selling: Number(newProduct.price_selling),
        current_stock: Number(newProduct.current_stock),
      })
    });
    if (res.ok) {
      // بعد الإضافة، أعد جلب المنتجات من الـ API لضمان ظهور الوزن
      fetchProductsFromDB().then(data => setProducts(data));
      setIsAddOpen(false);
      setNewProduct({ name: '', weight: '', purchase_price: '', price_selling: '', current_stock: '' });
    }
  };

  // فتح نافذة تنشيط مندوب
  const openActivateDialog = () => {
    console.log('[TEST] فتح نافذة تنشيط مندوب');
    setIsActivateOpen(true);
    setStep('chooseDelegate');
    setSelectedDelegate(null);
    setWithdrawItems([]);
  };

  // عند اختيار مندوب
  const handleDelegateSelect = (delegate: any) => {
    console.log('[TEST] تم اختيار مندوب:', delegate);
    setSelectedDelegate(delegate);
    setStep('chooseProducts');
    const items = products.map((p, idx) => ({ productId: String(p.id ?? idx), productName: p.name, quantity: 0 }));
    setWithdrawItems(items);
    console.log('[TEST] قائمة المنتجات للسحب:', items);
  };

  // تغيير كمية منتج معين
  const handleQuantityChange = (productId: string, value: number) => {
    setWithdrawItems(items => {
      const updated = items.map(item =>
        String(item.productId) === String(productId) ? { ...item, quantity: value } : item
      );
      console.log('[TEST] تغيير كمية المنتج', productId, 'إلى', value, 'الحالة الجديدة:', updated);
      return updated;
    });
  };

  // تأكيد السحب
  const handleConfirmWithdraw = () => {
    console.log('[TEST] تأكيد السحب:', {
      delegate: selectedDelegate,
      withdrawItems: withdrawItems.filter(i => i.quantity > 0)
    });
    // خصم الكميات من المخزون
    const updatedProducts = products.map(p => {
      const item = withdrawItems.find(i => i.productId === p.id);
      if (item && item.quantity > 0) {
        return { ...p, current_stock: Math.max(0, p.current_stock - item.quantity) };
      }
      return p;
    });
    setProducts(updatedProducts);
    // إضافة للسجل
    addWithdrawalLog({
      id: simpleId(),
      delegateId: selectedDelegate.id,
      delegateName: selectedDelegate.name,
      date: new Date().toISOString(),
      items: withdrawItems.filter(i => i.quantity > 0)
    });
    setIsActivateOpen(false);
    setStep(null);
    setSelectedDelegate(null);
    setWithdrawItems([]);
    console.log('[TEST] تم إنهاء عملية السحب وتحديث المخزون.');
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="البحث عن المنتجات..."
            className="pr-8"
            value={searchTerm}
            onChange={handleSearchChange}
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
          <Button size="sm" className="flex items-center gap-1" onClick={openActivateDialog}>
            <FileUp size={16} />
            تنشيط مندوب
          </Button>
          <Button size="sm" className="flex items-center gap-1" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} />
            منتج جديد
          </Button>
        </div>
      </div>
      <Card className="paper-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={18} />
            بطاقات مخزون المنتجات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-right">اسم المنتج</th>
                  <th className="px-4 py-3 text-right">الوزن</th>
                  <th className="px-4 py-3 text-right">سعر الشراء</th>
                  <th className="px-4 py-3 text-right">سعر البيع</th>
                  <th className="px-4 py-3 text-right">المخزون الحالي</th>
                  <th className="px-4 py-3 text-right">آخر تحديث</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      لا توجد منتجات مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, idx) => (
                    <tr key={product.id || product.name + '-' + idx} className="hover:bg-muted/50">
                      <td className="px-4 py-3">{product.name}</td>
                      <td className="px-4 py-3">{product.weight ? product.weight + ' كجم' : '-'}</td>
                      <td className="px-4 py-3">{product.purchase_price} جم</td>
                      <td className="px-4 py-3">{product.price_selling} جم</td>
                      <td className="px-4 py-3">{product.current_stock} وحدة</td>
                      <td className="px-4 py-3">{new Date(product.updated_at).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <Dialog.Title className="mb-4 font-bold">إضافة منتج جديد</Dialog.Title>
            <div className="space-y-3">
              <Input placeholder="اسم المنتج" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
              <Input placeholder="الوزن (كجم)" type="number" value={newProduct.weight} onChange={e => setNewProduct({ ...newProduct, weight: e.target.value })} />
              <Input placeholder="سعر الشراء" type="number" value={newProduct.purchase_price} onChange={e => setNewProduct({ ...newProduct, purchase_price: e.target.value })} />
              <Input placeholder="سعر البيع" type="number" value={newProduct.price_selling} onChange={e => setNewProduct({ ...newProduct, price_selling: e.target.value })} />
              <Input placeholder="المخزون الحالي" type="number" value={newProduct.current_stock} onChange={e => setNewProduct({ ...newProduct, current_stock: e.target.value })} />
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddProduct}>إضافة</Button>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>إلغاء</Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      <DelegateActivationDialog
        open={isActivateOpen}
        onClose={() => setIsActivateOpen(false)}
        step={step}
        setStep={setStep}
        delegates={mockDelegates}
        selectedDelegate={selectedDelegate}
        onDelegateSelect={handleDelegateSelect}
        withdrawItems={withdrawItems}
        products={products}
        onQuantityChange={handleQuantityChange}
        onConfirmWithdraw={handleConfirmWithdraw}
      />
    </div>
  );
};

export default Inventory;
