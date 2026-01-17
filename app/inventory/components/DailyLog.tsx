"use client";

import React, { useEffect, useState } from "react";
import ExportButtonCSV from "@/components/ExportButtonCSV";
import Modal from "@/components/Modal";

interface Transaction {
  _id: string;
  productId: { name: string };
  quantity: number;
  type: string;
  party?: string;
  branchId?: { name: string }; // إضافة الفرع
}

interface DailyLogProps {
  report: any[];
  during: any;
  onUpdateDuring: (updatedTransactions: any[]) => void; // إضافة الخاصية هنا
  iconMap?: {
    purchase?: React.ReactNode;
    outgoing?: React.ReactNode;
    incoming?: React.ReactNode;
    damaged?: React.ReactNode;
    sale?: React.ReactNode;
    expense?: React.ReactNode;
  };
}

const typeLabels: Record<string, string> = {
  purchase: "مشتريات",
  outgoing: "تحميل",
  incoming: "مرتجع",
  damaged: "تالف",
  sale: "بيع",
  expense: "مصروف",
};

type NotificationType = "success" | "error";

export default function DailyLog({
  report,
  during,
  onUpdateDuring,
  iconMap,
}: DailyLogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [partyFilter, setPartyFilter] = useState<string>("");

  const filteredTransactions = during.filter((t: any) => {
    const typeMatch = !typeFilter || t.type === typeFilter;
    const partyName = t.branchId?.name || t.party || "-";
    const partyMatch = !partyFilter || partyName === partyFilter;
    return typeMatch && partyMatch;
  });

  // جلب الجهات الفريدة للفلترة
  const uniqueParties = Array.from(
    new Set(
      during.map((t: any) => t.branchId?.name || t.party || "-")
    )
  ).filter(p => p !== "-");

  const handleDeleteClick = (id: string) => {
    setSelectedTransactionId(id);
    setModalType("delete");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTransactionId(null);
  };

  const handleDeleteConfirm = async (id: string) => {
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      // التحقق مما إذا كانت عملية مالية أم مخزنية
      const transactionToDelete = during.find((t: any) => t._id === id);
      const url = transactionToDelete?.isFinancial
        ? `/api/finance/transactions?id=${id}`
        : `/api/transactions/${id}`;

      await fetch(url, {
        method: "DELETE",
      });

      onUpdateDuring(during.filter((t: any) => t._id !== id));

      setNotification({ type: "success", message: "تم حذف العنصر بنجاح" });
    } catch (error) {
      setNotification({ type: "error", message: "فشل في حذف العنصر" });
    } finally {
      setIsLoading(false);
    }
  };

  // إضافة تأثير للإشعارات
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="bg-gray-700 p-4 rounded-lg relative">
      {/* إضافة الإشعارات */}
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg ${notification.type === "success" ? "bg-green-600" : "bg-red-600"
            } text-white z-50`}
        >
          {notification.message}
        </div>
      )}

      <h3 className="flex justify-between items-center text-lg font-semibold mb-3 text-gray-200 border-b border-gray-600 pb-2">
        سجل عمليات اليوم
        <ExportButtonCSV
          data={filteredTransactions}
          fileName={`daily-log-${new Date().toISOString().split("T")[0]}`}
          label="تصدير السجل"
        />
      </h3>

      {/* أدوات الفلترة */}
      <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">النوع:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white text-xs rounded-md p-1.5 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">الكل</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">الجهة:</label>
          <select
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white text-xs rounded-md p-1.5 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">الكل</option>
            {uniqueParties.map((party: any) => (
              <option key={party} value={party}>{party}</option>
            ))}
          </select>
        </div>

        {(typeFilter || partyFilter) && (
          <button
            onClick={() => { setTypeFilter(""); setPartyFilter(""); }}
            className="text-xs text-red-400 hover:text-red-300 underline"
          >
            إعادة تعيين
          </button>
        )}
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-gray-500 text-center p-4">
          {during.length === 0 ? "لا توجد عمليات مسجلة لهذا اليوم." : "لا توجد نتائج تطابق الفلترة."}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-justify">
              <th className="p-2">النوع</th>
              <th className="p-2">الصنف / الوصف</th>
              <th className="p-2">الكمية / المبلغ</th>
              <th className="p-2">الجهة</th>
              <th className="p-2">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t: any, i: number) => (
              <tr key={i} className="bg-gray-800 rounded-md">
                <td className="p-2 flex items-center gap-2">
                  {iconMap && iconMap[t.type as keyof typeof iconMap]}
                  <span className="font-semibold">{typeLabels[t.type]}</span>
                </td>
                <td className="p-2">
                  {t.isFinancial ? (
                    <div className="flex flex-col">
                      <span className="text-blue-300 font-bold">
                        {t.expenseCategoryId?.name || t.category || "مصروف"}
                        {t.expenseSubtype && ` - ${t.expenseSubtype}`}
                      </span>
                      {t.description && (
                        <span className="text-xs text-gray-400 italic">
                          {t.description}
                        </span>
                      )}
                    </div>
                  ) : (
                    t.productId?.name || ""
                  )}
                </td>
                <td className="p-2 font-mono">
                  {t.isFinancial ? (
                    <span className="text-red-400 font-bold">
                      {t.amount?.toLocaleString()} ج.م
                    </span>
                  ) : (
                    t.quantity
                  )}
                </td>
                <td className="p-2">
                  {t.branchId?.name ? (
                    <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">
                      {t.branchId.name}
                    </span>
                  ) : (
                    t.party || "-"
                  )}
                </td>
                <td className="p-2 flex gap-2">
                  {/* {t.type !== "purchase" && ( */}
                  <button
                    onClick={() => handleDeleteClick(t._id)}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded disabled:opacity-50"
                  >
                    {isLoading ? "جاري الحذف..." : "حذف"}
                  </button>
                  {/* )} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal
        open={isModalOpen}
        type={modalType}
        onClose={handleModalClose}
        onSuccess={() => { }}
        products={[]}
        selectedDate={null}
        transactionId={selectedTransactionId}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
