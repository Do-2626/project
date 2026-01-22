"use client";

import React, { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import {
  FaBars, FaBell, FaCalendarDays, FaArrowRight,
  FaArrowUp, FaArrowDown, FaCartPlus, FaWallet, FaBan,
  FaPlus, FaLock, FaCircleInfo, FaCircle, FaRightLeft
} from "react-icons/fa6";

import InventoryTable from "@/app/inventory/components/InventoryTable";
import Modal from "@/components/Modal";
import WeeklyLog from "@/app/inventory/components/WeeklyLog";
import PasswordPrompt from "@/components/PasswordPrompt";
import DataTable from "@/components/DataTable";
import { Product } from "./types";

export default function InventoryPage() {
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Add Material Symbols font if not present
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [showProtected, setShowProtected] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoadingReport, setIsLoadingReport] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetch("/api/inventory").then(res => res.json()).then(setProducts);
  }, []);

  // Fetch report when date or products changes
  useEffect(() => {
    setIsLoadingReport(true);
    fetch(`/api/inventory/daily-report?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setDailyReport(data);
        setIsLoadingReport(false);
      });
  }, [selectedDate, products]);

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const response = await fetch(`/api/inventory/products?id=${updatedProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) throw new Error("فشل في تحديث المنتج");
      const updatedData = await response.json();
      setProducts(prev => prev.map(p => (p._id === updatedProduct._id ? updatedData : p)));
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  return (
    <div className="min-h-screen bg-[#101922] text-white font-cairo dir-rtl" dir="rtl">
      {/* Dynamic Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,#1a2533_0%,#101922_100%)] -z-10"></div>

      {/* Header / TopAppBar */}
      <header className="z-50 flex items-center bg-[#101922]/80 backdrop-blur-md p-4 border-b border-white/10 justify-between">
        <div className="text-white flex size-10 shrink-0 items-center justify-center bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
          <FaBars />
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-white text-lg font-bold leading-tight tracking-tight">نظام إدارة توتى بيروتى</h1>
          <p className="text-[#1173d4] text-[10px] md:text-xs font-medium">لوحة التحكم الرئيسية</p>
        </div>
        <div className="text-white flex size-10 shrink-0 items-center justify-center bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
          <FaBell />
        </div>
      </header>

      <main className="max-w-5xl mx-auto pb-24">
        {/* Clickable Date Selector Section */}
        <section className="px-4 pt-10">
          <div
            onClick={openDatePicker}
            className="flex flex-col gap-2 max-w-sm cursor-pointer group appearance-none [-webkit-appearance:none] [-moz-appearance:none]"
          >
            <label className="text-[#9cabba] text-sm font-bold pr-1 flex items-center gap-2 group-hover:text-[#1173d4] transition-colors">
              <FaCalendarDays className="text-[#1173d4] text-xs" />
              اليوم المختار للمتابعة
            </label>
            <div className="relative">
              <input
                ref={dateInputRef}
                className="w-full bg-[#1c2127] border border-[#3b4754] text-white rounded-2xl h-16 px-5 focus:ring-2 focus:ring-[#1173d4] focus:border-transparent outline-none transition-all cursor-pointer shadow-lg group-hover:border-[#1173d4]/50 select-none"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1173d4] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                <FaPlus className="text-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons Section */}
        <section className="px-4 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-bold">العمليات اليومية</h2>
            <Link
              href="/inventory/expected-sales"
              className="text-[#1173d4] text-xs bg-[#1173d4]/10 px-4 py-2 rounded-xl hover:bg-[#1173d4] hover:text-white transition-all font-bold border border-[#1173d4]/20"
            >
              تسجيل مبيعات الفروع
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { type: 'outgoing', label: 'تحميل', icon: <FaArrowUp />, color: 'red' },
              { type: 'incoming', label: 'مرتجع', icon: <FaArrowDown />, color: 'yellow' },
              { type: 'purchase', label: 'شراء', icon: <FaCartPlus />, color: 'green' },
              { type: 'transfer', label: 'تحويل', icon: <FaRightLeft />, color: 'blue' },
              { type: 'dailyExpense', label: 'مصروف', icon: <FaWallet />, color: 'orange' },
              { type: 'damaged', label: 'تالف', icon: <FaBan />, color: 'purple' },
            ].map((btn) => (
              <button
                key={btn.type}
                onClick={() => setModal({ open: true, type: btn.type, data: null })}
                className={`flex flex-col gap-3 rounded-2xl border border-${btn.color}-500/20 bg-${btn.color}-500/10 p-6 items-center justify-center transition-all hover:border-${btn.color}-500/40 hover:bg-${btn.color}-500/20 active:scale-95 group shadow-sm`}
              >
                <div className={`text-${btn.color}-500 bg-${btn.color}-500/20 p-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                  {btn.icon}
                </div>
                <h2 className="text-white text-sm font-black tracking-wide">{btn.label}</h2>
              </button>
            ))}
          </div>
        </section>

        {/* Inventory Status Section */}
        <section className="px-4 pt-14">
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-white text-xl font-bold">حالة المخزون</h2>
              <div className="flex items-center gap-1.5 bg-[#1173d4]/10 px-2.5 py-1 rounded-full border border-[#1173d4]/20">
                <div className="size-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                <span className="text-[#1173d4] text-[10px] font-bold">مباشر الآن</span>
              </div>
            </div>

            <button
              onClick={() => setModal({ open: true, type: "addProduct", data: null })}
              className="bg-[#1173d4] hover:bg-[#1100f4] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-[#1173d4]/10 transition-all active:scale-95 flex items-center gap-2"
            >
              <FaCircle className="text-base" />
              إضافة صنف جديد
            </button>
          </div>

          <div className="bg-[#1c2127] border border-[#3b4754] rounded-2xl overflow-hidden shadow-2xl">
            <DataTable
              data={dailyReport?.report || []}
              isLoading={isLoadingReport}
              emptyMessage="لا توجد بيانات ليوم محدد"
              columns={[
                {
                  header: "الصنف",
                  className: "text-right",
                  render: (r: any) => <span className="text-sm md:text-base font-bold text-gray-200">{r.product.name}</span>
                },
                {
                  header: "بداية اليوم",
                  className: "text-center",
                  render: (r: any) => <span className="text-[#9cabba] font-mono font-bold text-xs">{r.startQty}</span>
                },
                {
                  header: "نهاية اليوم",
                  className: "text-center w-32",
                  render: (r: any) => (
                    <div className="bg-[#101922] py-2 px-4 rounded-xl border border-[#3b4754]/50 inline-block min-w-[60px] font-black text-[#1173d4] text-lg shadow-inner">
                      {r.endQty}
                    </div>
                  )
                }
              ]}
              className="border-none"
              rowClassName={() => "border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"}
            />
          </div>
        </section>

        {/* Weekly Logs Section */}
        <section className="px-4 pt-16">
          <WeeklyLog />
        </section>

        {/* Management & Reports Section */}
        <section className="px-4 pt-20 mb-10">
          <div className={`relative overflow-hidden rounded-[2rem] p-10 border transition-all duration-700 ${showProtected
            ? 'bg-[#1b2127] border-[#3b4754] shadow-2xl'
            : 'bg-[#1173d4]/5 border-[#1173d4]/10'
            }`}>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1173d4]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-[1.25rem] shadow-lg ${showProtected ? 'bg-green-500/20 text-green-500' : 'bg-[#1173d4]/20 text-[#1173d4]'}`}>
                    {showProtected ? <FaCircleInfo className="text-2xl" /> : <FaLock className="text-2xl" />}
                  </div>
                  <div>
                    <h2 className="text-white text-2xl font-black">
                      {showProtected ? 'إدارة البيانات المركزية' : 'مركز الحماية المالية'}
                    </h2>
                    <p className="text-[#9cabba] text-xs md:text-sm mt-1.5 font-medium">
                      {showProtected
                        ? 'تعديل الأسعار ومراقبة القيمة الكلية للأصول'
                        : 'أدخل الرمز السري للوصول إلى الجداول المالية المتقدمة'}
                    </p>
                  </div>
                </div>
                {showProtected && (
                  <div className="bg-[#101922] p-6 rounded-2xl border border-[#3b4754] shadow-inner">
                    <span className="text-[#9cabba] text-[10px] font-black uppercase tracking-widest block mb-1">إجمالي قيمة المخزون</span>
                    <span className="text-green-500 font-black text-3xl flex items-baseline gap-2">
                      {products.reduce((acc, p) => {
                        const qty = dailyReport?.report?.find((r: any) => r.product._id === p._id)?.endQty || 0;
                        return acc + qty * (p.purchasePrice || 0);
                      }, 0).toLocaleString()}
                      <span className="text-sm opacity-60">د.ل</span>
                    </span>
                  </div>
                )}
              </div>

              {!showProtected ? (
                <div className="max-w-md mx-auto py-4">
                  <PasswordPrompt
                    onSuccess={(role) => {
                      setShowProtected(true);
                      setUserRole(role || "manager");
                    }}
                    label="كلمة المرور"
                    buttonText="فتح البيانات المطلوبة"
                  />
                </div>
              ) : (
                <div className="bg-[#101922]/50 rounded-2xl overflow-hidden border border-[#3b4754] shadow-2xl backdrop-blur-sm">
                  <InventoryTable
                    products={products}
                    transactions={[]}
                    onAddProduct={() => setModal({ open: true, type: "addProduct", data: null })}
                    showProtected={showProtected}
                    userRole={userRole}
                    dailyReport={dailyReport?.report}
                    onUpdateProduct={handleUpdateProduct}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Global Modals */}
      <Modal
        open={modal.open}
        type={modal.type}
        onClose={() => setModal({ open: false, type: "", data: null })}
        onSuccess={() => {
          setModal({ open: false, type: "", data: null });
          fetch("/api/inventory").then(res => res.json()).then(setProducts);
          // Refresh report manually
          fetch(`/api/inventory/daily-report?date=${selectedDate}`)
            .then(res => res.json())
            .then(setDailyReport);
        }}
        products={products}
        selectedDate={selectedDate}
        dailyReport={dailyReport?.report}
      />

      {/* Bottom Spacer */}
      <div className="h-20"></div>
    </div>
  );
}
