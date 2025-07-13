import React from "react";
import Calendar from "@/components/Calendar";
import dayjs from "dayjs";
import { FinancialTransaction } from "../types";

interface TransactionSummaryProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  totals: {
    totalExpenses: number;
    totalIncome: number;
    totalPurchases: number;
  };
}

export default function TransactionSummary({
  selectedDate,
  setSelectedDate,
  totals,
}: TransactionSummaryProps) {
  return (
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
            <p className="text-2xl font-bold text-red-500">
              {totals.totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-400">الإيرادات</p>
            <p className="text-2xl font-bold text-green-500">
              {totals.totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-400">المشتريات</p>
            <p className="text-2xl font-bold text-blue-500">
              {totals.totalPurchases.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
