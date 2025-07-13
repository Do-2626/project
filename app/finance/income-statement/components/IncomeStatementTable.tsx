import React from "react";
import { IncomeStatementData } from "../types";

interface IncomeStatementTableProps {
  data: IncomeStatementData;
}

export default function IncomeStatementTable({ data }: IncomeStatementTableProps) {
  if (!data) return <div className="text-gray-400 text-center p-4">لا توجد بيانات متاحة</div>;
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-gray-700 text-gray-300">
            <tr>
              <th className="px-6 py-3">البند</th>
              <th className="px-6 py-3">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-800 border-b border-gray-700">
              <td className="px-6 py-4 font-semibold">الإيرادات الإجمالية</td>
              <td className="px-6 py-4">{data.sales?.toFixed(2) ?? '0.00'}</td>
            </tr>
            
            <tr className="bg-gray-800 border-b border-gray-700">
              <td className="px-6 py-4 font-semibold">المصروفات الإجمالية</td>
              <td className="px-6 py-4">{data.totalExpenses?.toFixed(2) ?? '0.00'}</td>
            </tr>
            
            <tr className="bg-gray-800 border-b border-gray-700">
              <td className="px-6 py-4 font-semibold">صافي الربح</td>
              <td className="px-6 py-4">{data.netProfit?.toFixed(2) ?? '0.00'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
