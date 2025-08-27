"use client";

import React, { useEffect, useState } from "react";
import ExportButtonCSV from "@/components/ExportButtonCSV";

interface Transaction {
  _id: string;
  productId: { name: string };
  quantity: number;
  type: string;
  party?: string;
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

  const handleDelete = async (id: string) => {
    const password = prompt("أدخل كلمة المرور:");
    if (!password) {
      alert("يجب إدخال كلمة مرور");
      return;
    }

    if (password !== "123") {
      alert("كلمة المرور غير صحيحة");
      return;
    }

    setIsLoading(true);
    try {
      await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      // update during
      onUpdateDuring(report);

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

      <h3 className="text-lg font-semibold mb-3 text-gray-200 border-b border-gray-600 pb-2">
        سجل عمليات اليوم
      </h3>

      <ExportButtonCSV
        data={during}
        fileName={`daily-log-${new Date().toISOString().split("T")[0]}`}
        label="تصدير السجل"
      />

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
                <td className="p-2">{t.party || "-"}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => handleDelete(t._id)}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded disabled:opacity-50"
                  >
                    {isLoading ? "جاري الحذف..." : "حذف"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
