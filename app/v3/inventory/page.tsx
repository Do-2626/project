"use client";

import React, { useState, useEffect } from "react";
import "../inventory.css";
import {
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  History,
  LayoutDashboard
} from "lucide-react";
import { reportService, InventorySummaryItem, DailySummaryItem } from "@/services/reportService";
import { transactionService } from "@/services/transactionService";
import { productService } from "@/services/productService";
import { branchService } from "@/services/branchService";
import { Product, Branch, Transaction } from "@/lib/schemas-v3";

// Sub-components will be created in separate files, but for the main page we define the layout
import { V3ManagementModals } from "./components/V3ManagementModals";
import { V3Modal } from "./components/V3Modal";
import { V3TransactionForm } from "./components/V3TransactionForm";

// تنسيق الأرقام لضمان الاتساق بين السيرفر والكلينت (منع الـ Hydration Error)
const formatNumber = (num: number | string) => {
  return new Intl.NumberFormat('en', { useGrouping: false }).format(Number(num));
};

export default function InventoryV3Page() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventorySummaryItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // Modal states
  const [activeModal, setActiveModal] = useState<'purchase' | 'outgoing' | 'incoming' | 'damaged' | 'products' | 'branches' | 'suppliers' | null>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summary, recent, allBranches, allProducts] = await Promise.all([
        reportService.getInventorySummary({
          start_date: startDate,
          end_date: endDate,
          branch_id: selectedBranch || undefined
        }),
        transactionService.getAll({ limit: 10 } as any),
        branchService.getAll(),
        productService.getAll()
      ]);

      setInventory(summary);
      setRecentTransactions(recent.slice(0, 10));
      setBranches(allBranches);
      setProducts(allProducts);
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranch, startDate, endDate]);

  const filteredInventory = inventory.filter(item => {
    const product = products.find(p => p.id === item.productId);
    return product?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleTransactionSuccess = () => {
    setActiveModal(null);
    fetchData();
  };

  return (
    <div className="v3-inventory-container p-6">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-900">
            <LayoutDashboard />
            إدارة المخزون الاحترافية
          </h1>
          <p className="text-gray-500 mt-1">نظام التتبع والرقابة اللوجستية - الإصدار v3</p>
        </div>

        <div className="flex gap-3">
          <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="bg-white border px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="v3-number font-semibold">
              {mounted ? currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm">
              {mounted ? currentTime.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : "..."}
            </span>
          </div>
        </div>
      </header>

      {/* Quick Action Bar */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setActiveModal('outgoing')}
          className="v3-card p-4 flex flex-col items-center gap-2 hover:border-blue-900 group"
        >
          <ArrowUpRight className="text-blue-900 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">سحب بضاعة لفرع</span>
        </button>
        <button
          onClick={() => setActiveModal('incoming')}
          className="v3-card p-4 flex flex-col items-center gap-2 hover:border-emerald-600 group"
        >
          <ArrowDownLeft className="text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">إرجاع بضاعة من فرع</span>
        </button>
        <button
          onClick={() => setActiveModal('purchase')}
          className="v3-card p-4 flex flex-col items-center gap-2 hover:border-blue-900 group"
        >
          <PlusCircle className="text-blue-900 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">إضافة بضاعة من مورد</span>
        </button>
        <button
          onClick={() => setActiveModal('damaged')}
          className="v3-card p-4 flex flex-col items-center gap-2 hover:border-amber-600 group"
        >
          <AlertTriangle className="text-amber-600 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">خصم التالف</span>
        </button>
      </section>

      {/* Modals */}
      <V3Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={activeModal?.includes('products') || activeModal?.includes('branches') ? 'الإدارة المركزية' : 'تسجيل عملية مخزنية'}
      >
        {['purchase', 'outgoing', 'incoming', 'damaged'].includes(activeModal as string) && (
          <V3TransactionForm
            type={activeModal as any}
            products={products}
            branches={branches}
            onSuccess={handleTransactionSuccess}
            onCancel={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'products' && (
          <V3ManagementModals type="products" data={products} onRefresh={fetchData} />
        )}
        {activeModal === 'branches' && (
          <V3ManagementModals type="branches" data={branches} onRefresh={fetchData} />
        )}
      </V3Modal>

      {/* Filter Bar */}
      <header className="v3-card p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="بحث في المنتجات..."
              className="v3-input pr-10 min-w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 border-r pr-4">
            <Filter size={18} className="text-gray-400" />
            <select
              className="v3-input"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">كل الفروع</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              className="v3-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-gray-400">إلى</span>
            <input
              type="date"
              className="v3-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Inventory Table */}
        <div className="lg:col-span-2">
          <div className="v3-card overflow-hidden">
            <div className="p-4 border-bottom flex justify-between items-center v3-table-header">
              <span className="flex items-center gap-2">
                <Package size={20} />
                حالة المخزون الحالية
              </span>
              <span className="v3-number text-sm">إجمالي الأصناف: {mounted ? formatNumber(filteredInventory.length) : "0"}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">المنتج</th>
                    <th className="px-4 py-3">إجمالي الوارد</th>
                    <th className="px-4 py-3">إجمالي الصادر</th>
                    <th className="px-4 py-3">الصافي (الجرد)</th>
                    <th className="px-4 py-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInventory.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    const isLow = Number(item.netChange) < 10;
                    return (
                      <tr key={item.productId} className="v3-sku-row">
                        <td className="px-4 py-3 font-semibold">
                          <div>{product?.name || "منتج غير معروف"}</div>
                          <div className="text-[10px] text-gray-400 v3-number">{product?.id?.substring(0, 8) || "--------"}</div>
                        </td>
                        <td className="px-4 py-3 v3-number text-emerald-600">+{mounted ? formatNumber(Number(item.qtyPurchase) + Number(item.qtyIncoming)) : "0"}</td>
                        <td className="px-4 py-3 v3-number text-red-600">-{mounted ? formatNumber(Number(item.qtySale) + Number(item.qtyOutgoing) + Number(item.qtyDamaged)) : "0"}</td>
                        <td className="px-4 py-3 v3-number font-bold text-lg">{mounted ? formatNumber(item.netChange) : "0"}</td>
                        <td className="px-4 py-3">
                          <span className={`v3-badge ${isLow ? 'v3-badge-amber' : 'v3-badge-emerald'}`}>
                            {isLow ? 'مخزون منخفض' : 'متوفر'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                        لا توجد بيانات متاحة في الفترة المحددة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Recent Transactions & Quick Stats */}
        <div className="flex flex-col gap-6">
          <div className="v3-card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2 border-b pb-2">
              <History size={18} className="text-blue-900" />
              آخر الحركات
            </h3>
            <div className="space-y-4">
              {recentTransactions.map(tx => {
                const product = products.find(p => p.id === tx.product_id);
                const typeLabel = {
                  purchase: 'شراء',
                  outgoing: 'صادر',
                  incoming: 'وارد',
                  damaged: 'تالف',
                  sale: 'بيع',
                  expense: 'مصروف',
                  income: 'دخل'
                }[tx.type];

                return (
                  <div key={tx.id} className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="font-semibold text-sm">{product?.name}</div>
                      <div className="text-xs text-gray-500">{new Date(tx.date as string).toLocaleDateString('ar-EG')}</div>
                    </div>
                    <div className="text-left">
                      <div className="v3-number font-bold text-sm">
                        {tx.quantity}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-400">{typeLabel}</div>
                    </div>
                  </div>
                );
              })}
              {recentTransactions.length === 0 && (
                <div className="text-center text-gray-400 py-4">لا توجد حركات حديثة</div>
              )}
            </div>
          </div>

          <div className="v3-card p-5 bg-blue-900 text-white">
            <h3 className="font-bold mb-2">إجمالي قيمة المخزون التقديرية</h3>
            <div className="v3-number text-3xl font-black">
              {mounted ? formatNumber(inventory.reduce((acc, item) => {
                const product = products.find(p => p.id === item.productId);
                return acc + (Number(item.netChange) * (product?.selling_price || 0));
              }, 0)) : "0"} <span className="text-sm font-normal">SAR</span>
            </div>
            <p className="text-blue-200 text-xs mt-2">يعتمد على أسعار البيع المحدثة حالياً</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveModal('products')}
              className="v3-card p-3 text-sm font-bold text-center hover:bg-gray-50 transition-colors"
            >
              إدارة المنتجات
            </button>
            <button
              onClick={() => setActiveModal('branches')}
              className="v3-card p-3 text-sm font-bold text-center hover:bg-gray-50 transition-colors"
            >
              إدارة الفروع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
