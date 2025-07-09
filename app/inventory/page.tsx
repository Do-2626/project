"use client";
import React, { useEffect, useState } from "react";
import InventoryTable from "@/components/InventoryTable";
import Modal from "@/components/Modal";
import Calendar from "@/components/Calendar";
import DailyLog from "@/components/DailyLog";
import PasswordPrompt from "@/components/PasswordPrompt";
import dayjs from "dayjs";
import { FaCartPlus, FaArrowUp, FaArrowDown, FaBan } from "react-icons/fa6";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [showProtected, setShowProtected] = useState(false);

  // Fetch products
  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  // Fetch transactions for selected date
  useEffect(() => {
    fetch(`/api/transactions?date=${selectedDate}`)
      .then((res) => res.json())
      .then(setTransactions);
  }, [selectedDate]);

  // Fetch daily report for selected date
  useEffect(() => {
    fetch(`/api/inventory/daily-report?date=${selectedDate}`)
      .then((res) => res.json())
      .then(setDailyReport);
  }, [selectedDate, products, transactions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 bg-fixed">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 drop-shadow-lg tracking-wide font-cairo">
          نظام إدارة المخزون اليومي
        </h1>
        <p className="text-gray-300 mt-2 text-lg font-medium font-cairo">
          إدارة شاملة للمخزون والعمليات اليومية
        </p>
      </header>
      <main className="grid gap-8 font-cairo">
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
          {/* <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-white drop-shadow font-cairo">
              قائمة الأصناف
            </h2>
            <button
              onClick={() =>
                setModal({ open: true, type: "addProduct", data: null })
              }
              className="bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-400 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition duration-200 text-lg flex items-center gap-2 font-cairo"
              title="إضافة صنف جديد"
            >
              <span className="inline-flex items-center gap-2">
                <i className="fas fa-plus-circle"></i>
                إضافة صنف جديد
              </span>
            </button>
          </div> */}
          {/* <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900 shadow-inner mb-8">
            <InventoryTable
              products={products}
              transactions={transactions}
              onAddProduct={() =>
                setModal({ open: true, type: "addProduct", data: null })
              }
              showProtected={showProtected}
            />
          </div> */}

          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white drop-shadow">
              اليوم
            </h2>
            <Calendar selectedDate={selectedDate} onChange={setSelectedDate} />
          </div>
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 text-center tracking-wide font-cairo">
              العمليات اليومية
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-center">
              <button
                onClick={() => setModal({ open: true, type: "outgoing", data: null })}
                className="action-btn bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400 text-white font-bold py-4 px-2 rounded-xl shadow-lg flex flex-col items-center gap-2 transition duration-200 text-base"
                title="تسجيل عملية تحميل"
              >
                <FaArrowUp className="mb-1" />
                تحميل
              </button>
              <button
                onClick={() => setModal({ open: true, type: "incoming", data: null })}
                className="action-btn bg-yellow-500 hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300 text-white font-bold py-4 px-2 rounded-xl shadow-lg flex flex-col items-center gap-2 transition duration-200 text-base"
                title="تسجيل عملية مرتجع"
              >
                <FaArrowDown className="mb-1" />
                مرتجع
              </button>
              <button
                onClick={() => setModal({ open: true, type: "damaged", data: null })}
                className="action-btn bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 text-white font-bold py-4 px-2 rounded-xl shadow-lg flex flex-col items-center gap-2 transition duration-200 text-base"
                title="تسجيل عملية تالف"
              >
                <FaBan className="mb-1" />
                تالف
              </button>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-gray-700 p-4 rounded-xl mt-6 shadow-inner border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-gray-200 border-b border-gray-600 pb-2">
                حالة المخزون
              </h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-blue-300">الصنف</th>
                    <th className="p-2 text-blue-300">بداية اليوم</th>
                    <th className="p-2 text-blue-300">نهاية اليوم</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyReport?.report?.map((r: any, idx: number) => (
                    <tr
                      key={r.product._id}
                      className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}
                    >
                      <td className="p-2 font-medium text-white">
                        {r.product.name}
                      </td>
                      <td className="p-2 text-gray-200">{r.startQty}</td>
                      <td className="p-2 text-gray-200">{r.endQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="">
              {dailyReport && (
                <DailyLog
                  report={dailyReport.report}
                  during={dailyReport.during}
                  iconMap={{
                    purchase: <FaCartPlus className="inline text-green-400 mr-1" />,
                    outgoing: <FaArrowUp className="inline text-red-400 mr-1" />,
                    incoming: <FaArrowDown className="inline text-yellow-400 mr-1" />,
                    damaged: <FaBan className="inline text-purple-400 mr-1" />,
                  }}
                />
              )}
              <h2 className="text-xl font-semibold mt-4 text-white drop-shadow">
                التقارير
              </h2>
              {!showProtected ? (
                <div className="mb-4">
                  <PasswordPrompt
                    onSuccess={() => setShowProtected(true)}
                    label="كلمة المرور لعرض التقارير المالية"
                    buttonText="تأكيد"
                  />
                </div>
              ) : (
                <div className="bg-gray-700 p-4 rounded-xl mb-6 shadow-inner border border-gray-600">
                  <p className="text-gray-300">إجمالي قيمة المخزون الحالية</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">
                    {products
                      .reduce((acc: number, p: any) => {
                        const qty =
                          dailyReport?.report?.find(
                            (r: any) => r.product._id === p._id
                          )?.endQty || 0;
                        return acc + qty * (p.purchasePrice || 0);
                      }, 0)
                      .toFixed(2)}{" "}
                    جنيه
                  </p>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </main>
      <Modal
        open={modal.open}
        type={modal.type}
        onClose={() => setModal({ open: false, type: "", data: null })}
        onSuccess={() => {
          setModal({ open: false, type: "", data: null });
          fetch("/api/inventory")
            .then((res) => res.json())
            .then(setProducts);
          fetch(`/api/transactions?date=${selectedDate}`)
            .then((res) => res.json())
            .then(setTransactions);
          fetch(`/api/inventory/daily-report?date=${selectedDate}`)
            .then((res) => res.json())
            .then(setDailyReport);
        }}
        products={products}
        selectedDate={selectedDate}
      />
    </div>
  );
}
