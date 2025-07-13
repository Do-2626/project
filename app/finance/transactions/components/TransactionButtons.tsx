import React from "react";
import { FaMoneyBillWave, FaShoppingCart, FaReceipt } from "react-icons/fa";
import ExportButton from "@/components/ExportButton";
import { FinancialTransaction } from "../types";

interface TransactionButtonsProps {
  openModal: (type: "expense" | "income" | "purchase") => void;
  filterType: string;
  setFilterType: (type: string) => void;
  transactions: FinancialTransaction[];
}

export default function TransactionButtons({
  openModal,
  filterType,
  setFilterType,
  transactions,
}: TransactionButtonsProps) {
  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => openModal("expense")}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
        >
          <FaMoneyBillWave size={20} />
          <span className="text-lg font-semibold">إضافة مصروف</span>
        </button>
        <button
          onClick={() => openModal("income")}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
        >
          <FaReceipt size={20} />
          <span className="text-lg font-semibold">إضافة إيراد</span>
        </button>
        <button
          onClick={() => openModal("purchase")}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
        >
          <FaShoppingCart size={20} />
          <span className="text-lg font-semibold">تسجيل مشتريات</span>
        </button>
      </div>
      <div className="bg-gray-800 my-8 rounded-xl shadow-lg border border-gray-700 overflow-hidden w-full">
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
              fileName={`financial-transactions-${
                new Date().toISOString().split("T")[0]
              }`}
              label="تصدير"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
