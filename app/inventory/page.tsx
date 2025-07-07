"use client";
import React, { useEffect, useState } from "react";
import InventoryTable from "@/components/InventoryTable";
import Modal from "@/components/Modal";
import Calendar from "@/components/Calendar";
import DailyLog from "@/components/DailyLog";
import dayjs from "dayjs";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [dailyReport, setDailyReport] = useState<any>(null);

  // Fetch products
  useEffect(() => {
    fetch("/api/inventory").then(res => res.json()).then(setProducts);
  }, []);

  // Fetch transactions for selected date
  useEffect(() => {
    fetch(`/api/transactions?date=${selectedDate}`)
      .then(res => res.json())
      .then(setTransactions);
  }, [selectedDate]);

  // Fetch daily report for selected date
  useEffect(() => {
    fetch(`/api/inventory/daily-report?date=${selectedDate}`)
      .then(res => res.json())
      .then(setDailyReport);
  }, [selectedDate, products, transactions]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-400">نظام إدارة المخزون اليومي</h1>
        <p className="text-gray-400 mt-2">إدارة شاملة للمخزون والعمليات اليومية</p>
      </header>
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <button onClick={() => setModal({ open: true, type: 'purchase', data: null })} className="action-btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow flex items-center gap-2">
          <i className="fas fa-shopping-cart"></i> مشتريات
        </button>
        <button onClick={() => setModal({ open: true, type: 'outgoing', data: null })} className="action-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow flex items-center gap-2">
          <i className="fas fa-arrow-up"></i> صادر
        </button>
        <button onClick={() => setModal({ open: true, type: 'incoming', data: null })} className="action-btn bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg shadow flex items-center gap-2">
          <i className="fas fa-arrow-down"></i> وارد
        </button>
        <button onClick={() => setModal({ open: true, type: 'damaged', data: null })} className="action-btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow flex items-center gap-2">
          <i className="fas fa-heart-broken"></i> تالف
        </button>
      </div>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
          <InventoryTable products={products} transactions={transactions} onAddProduct={() => setModal({ open: true, type: "addProduct", data: null })} />
         
        </div>
        <div className="space-y-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">التقويم</h2>
            <Calendar selectedDate={selectedDate} onChange={setSelectedDate} />
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">التقارير</h2>
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <p className="text-gray-400">إجمالي قيمة المخزون الحالية</p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {products.reduce((acc: number, p: any) => {
                  const qty = dailyReport?.report?.find((r: any) => r.product._id === p._id)?.endQty || 0;
                  return acc + qty * (p.purchasePrice || 0);
                }, 0).toFixed(2)} جنيه
              </p>
            </div>
            {dailyReport && <DailyLog report={dailyReport.report} during={dailyReport.during} />}
            <div className="bg-gray-700 p-4 rounded-lg mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-200 border-b border-gray-600 pb-2">حالة المخزون</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-2">الصنف</th>
                    <th className="p-2">بداية اليوم</th>
                    <th className="p-2">نهاية اليوم</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyReport?.report?.map((r: any) => (
                    <tr key={r.product._id}>
                      <td className="p-2">{r.product.name}</td>
                      <td className="p-2">{r.startQty}</td>
                      <td className="p-2">{r.endQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Modal open={modal.open} type={modal.type} onClose={() => setModal({ open: false, type: "", data: null })} onSuccess={() => {
        setModal({ open: false, type: "", data: null });
        fetch("/api/inventory").then(res => res.json()).then(setProducts);
        fetch(`/api/transactions?date=${selectedDate}`).then(res => res.json()).then(setTransactions);
        fetch(`/api/inventory/daily-report?date=${selectedDate}`).then(res => res.json()).then(setDailyReport);
      }} products={products} selectedDate={selectedDate} />
    </div>
  );
}
