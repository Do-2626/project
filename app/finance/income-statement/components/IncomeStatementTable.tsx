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
              <td className="px-6 py-4 font-semibold">الإيرادات</td>
              <td className="px-6 py-4"></td>
            </tr>
            {data.revenues?.map((revenue, index) => (
              <tr key={index} className="bg-gray-800 border-b border-gray-700">
                <td className="px-6 py-4 pl-8">{revenue.category}</td>
                <td className="px-6 py-4">{revenue.amount.toFixed(2)}</td>
              </tr>
            ))}
            
            <tr className="bg-gray-800 border-b border-gray-700">
              <td className="px-6 py-4 font-semibold">المصروفات</td>
              <td className="px-6 py-4"></td>
            </tr>
            {data.expenses?.map((expense, index) => (
              <tr key={index} className="bg-gray-800 border-b border-gray-700">
                <td className="px-6 py-4 pl-8">{expense.category}</td>
                <td className="px-6 py-4">{expense.amount.toFixed(2)}</td>
              </tr>
            ))}
            
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
