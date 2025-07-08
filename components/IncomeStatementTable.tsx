import React from 'react';

interface IncomeStatementData {
  startDate: string;
  endDate: string;
  sales: number;
  otherIncome: number;
  totalIncome: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  otherExpenses: number;
  totalExpenses: number;
  netProfit: number;
}

interface IncomeStatementTableProps {
  data: IncomeStatementData;
}

export default function IncomeStatementTable({ data }: IncomeStatementTableProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center text-white border-b border-gray-700 pb-2">
        ملخص الدخل من {data.startDate} إلى {data.endDate}
      </h2>
      
      {/* قسم الإيرادات */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-green-400">الإيرادات</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm md:text-base">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-3 text-right">البند</th>
                <th className="p-3 text-right">القيمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr className="hover:bg-gray-700">
                <td className="p-3 text-gray-300">مبيعات المنتجات</td>
                <td className="p-3 text-green-400 font-semibold">{data.sales.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-gray-700">
                <td className="p-3 text-gray-300">إيرادات أخرى</td>
                <td className="p-3 text-green-400 font-semibold">{data.otherIncome.toFixed(2)}</td>
              </tr>
              <tr className="bg-gray-700">
                <td className="p-3 font-bold text-white">إجمالي الإيرادات</td>
                <td className="p-3 font-bold text-green-400">{data.totalIncome.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* قسم المصروفات */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-red-400">المصروفات</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm md:text-base">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-3 text-right">البند</th>
                <th className="p-3 text-right">القيمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr className="hover:bg-gray-700">
                <td className="p-3 text-gray-300">تكلفة البضاعة المباعة</td>
                <td className="p-3 text-red-400 font-semibold">{data.costOfGoodsSold.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-gray-700">
                <td className="p-3 text-gray-300">مصروفات تشغيلية</td>
                <td className="p-3 text-red-400 font-semibold">{data.operatingExpenses.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-gray-700">
                <td className="p-3 text-gray-300">مصروفات أخرى</td>
                <td className="p-3 text-red-400 font-semibold">{data.otherExpenses.toFixed(2)}</td>
              </tr>
              <tr className="bg-gray-700">
                <td className="p-3 font-bold text-white">إجمالي المصروفات</td>
                <td className="p-3 font-bold text-red-400">{data.totalExpenses.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* صافي الربح */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">صافي الربح</h3>
          <span className={`text-xl font-bold ${data.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.netProfit.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}