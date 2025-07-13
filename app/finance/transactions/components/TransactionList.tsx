import React from "react";
import { FinancialTransaction } from "../types";
import { FaMoneyBillWave, FaShoppingCart, FaReceipt } from "react-icons/fa";
import dayjs from "dayjs";

interface TransactionListProps {
  transactions: FinancialTransaction[];
  handleDelete: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
}

export default function TransactionList({
  transactions,
  handleDelete,
  selectedDate,
  setSelectedDate,
  filterType,
  setFilterType,
}: TransactionListProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "expense":
        return "مصروف";
      case "income":
        return "إيراد";
      case "purchase":
        return "مشتريات";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "expense":
        return "text-red-500";
      case "income":
        return "text-green-500";
      case "purchase":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "expense":
        return <FaMoneyBillWave className="text-red-500" />;
      case "income":
        return <FaReceipt className="text-green-500" />;
      case "purchase":
        return <FaShoppingCart className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-gray-700 text-gray-300">
            <tr>
              <th className="px-6 py-3">النوع</th>
              <th className="px-6 py-3">التصنيف</th>
              <th className="px-6 py-3">المبلغ</th>
              <th className="px-6 py-3">الوصف</th>
              <th className="px-6 py-3">الجهة</th>
              <th className="px-6 py-3">رقم الفاتورة</th>
              <th className="px-6 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr className="bg-gray-800 border-b border-gray-700">
                <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                  <div className="space-y-4">
                    <p>لا توجد معاملات في الفترة المحددة</p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setSelectedDate(dayjs().format('YYYY-MM-DD'))}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        الرجوع إلى اليوم الحالي
                      </button>
                      <button
                        onClick={() => setFilterType('all')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                      >
                        إظهار كل المعاملات
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700"
                >
                  <td className="px-6 py-4 flex items-center gap-2">
                    {getTypeIcon(transaction.type)}
                    <span className={getTypeColor(transaction.type)}>
                      {getTypeLabel(transaction.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{transaction.category}</td>
                  <td className="px-6 py-4 font-semibold">
                    {transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {transaction.description || "-"}
                  </td>
                  <td className="px-6 py-4">{transaction.party || "-"}</td>
                  <td className="px-6 py-4">
                    {transaction.invoiceNumber || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
