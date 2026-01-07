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
  };
}

const typeLabels: Record<string, string> = {
  purchase: "مشتريات",
  outgoing: "تحميل",
  incoming: "مرتجع",
  damaged: "تالف",
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
      await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      onUpdateDuring(report.filter((t: Transaction) => t._id !== id));

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
          className={`fixed top-4 right-4 p-4 rounded-lg ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white z-50`}
        >
          {notification.message}
        </div>
      )}

      <h3 className="flex justify-between items-center text-lg font-semibold mb-3 text-gray-200 border-b border-gray-600 pb-2">
        سجل عمليات اليوم
        <ExportButtonCSV
          data={during}
          fileName={`daily-log-${new Date().toISOString().split("T")[0]}`}
          label="تصدير السجل"
        />
      </h3>

      {during.length === 0 ? (
        <div className="text-gray-500 text-center p-4">
          لا توجد عمليات مسجلة لهذا اليوم.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-justify">
              <th className="p-2">النوع</th>
              <th className="p-2">الصنف</th>
              <th className="p-2">الكمية</th>
              <th className="p-2">الجهة</th>
              <th className="p-2">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {during.map((t: any, i: number) => (
              <tr key={i} className="bg-gray-800 rounded-md">
                <td className="p-2 flex items-center gap-2">
                  {iconMap && iconMap[t.type as keyof typeof iconMap]}
                  <span className="font-semibold">{typeLabels[t.type]}</span>
                </td>
                <td className="p-2">{t.productId?.name || ""}</td>
                <td className="p-2">{t.quantity}</td>
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
        onSuccess={() => {}}
        products={[]}
        selectedDate={null}
        transactionId={selectedTransactionId}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
