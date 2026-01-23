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
    document.title = "المخزون - توتى بيروتى";
    // Add Material Symbols font if not present
    const link = document.createElement('link');
    // link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  // const [transactions, setTransactions] = useState([]);
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
      const response = await fetch(`/api/inventory/products/${updatedProduct._id}`, {
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
          <Link href="/" >
            <FaBars />
          </Link>

        </div>
        <div className="flex-1 text-center">
          <h1 className="text-white text-lg font-bold leading-tight tracking-tight">توتى بيروتى</h1>
        </div>
        <div className="text-white flex size-10 shrink-0 items-center justify-center bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
          <FaBell />
        </div>
      </header>

      <main className="max-w-5xl mx-auto position-relative top-[75px]">
        {/* Inventory Status Section */}
        <section className="px-4">

          <div className="flex items-center justify-between my-6 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <h2 className="text-white text-xl font-bold">حالة المخزون</h2>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setModal({ open: true, type: "operationSelector", data: null })}
                className="bg-[#1173d4] hover:bg-[#1100f4] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl shadow-[#1173d4]/10 transition-all active:scale-95 flex items-center gap-2 flex-shrink-0"
              >
                <FaPlus className="text-base" />
              </button>

              <div className="relative flex-grow sm:flex-grow-0">
                <button
                  onClick={openDatePicker}
                  className="bg-[#1173d4] hover:bg-[#1100f4] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl shadow-[#1173d4]/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                  type="button"
                >
                  <FaCalendarDays className="text-base" />
                  <input
                    ref={dateInputRef}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </button>
              </div>
            </div>
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
                  render: (r: any) => <span className="text-center text-sm md:text-base font-bold text-gray-200">{r.product.name}</span>
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
                    <div className="bg-[#101922] py-1 px-4 rounded-xl border border-[#3b4754]/50 inline-block min-w-[60px] font-black text-[#1173d4] text-lg shadow-inner">
                      {r.endQty}
                    </div>
                  )
                }
              ]}
              className="border-none"
              rowClassName={() => "border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 h-2"}
            />
          </div>

        </section>

        {/* Weekly Logs Section */}
        <section className="px-4 pt-16">
          <WeeklyLog />
        </section>

        {/* Management & Reports Section */}
        <section className="px-4 pt-16 mb-10">
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
        onSelectType={(type: string) => setModal({ ...modal, type })}
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
