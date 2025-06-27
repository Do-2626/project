"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Installment = {
  id: string | number;
  number: number;
  amount: number;
  cast?: {
    name?: string;
    area?: string;
  };
};

export default function InstallmentCollectionPage() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [stats, setStats] = useState({ totalCollectable: 0, totalCollected: 0 });
  const [loading, setLoading] = useState(true);

  async function fetchInstallments() {
    setLoading(true);
    const res = await fetch("/api/installment");
    const data = await res.json();
    setInstallments(data.installments);
    setStats(data.stats);
    setLoading(false);
  }

  useEffect(() => {
    fetchInstallments();
  }, []);

  async function handleAction(installmentId: any, action: string) {
    await fetch("/api/installment", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ installmentId, action }),
    });
    fetchInstallments();
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">تحصيل الأقساط الشهرية</h1>
      <div className="flex justify-between items-center bg-gray-100 rounded p-4 mb-6">
        <div>إجمالي المبلغ القابل للتحصيل: <span className="font-bold">{stats.totalCollectable}</span></div>
        <div>إجمالي المبلغ المحصل: <span className="font-bold text-green-600">{stats.totalCollected}</span></div>
      </div>
      {loading ? (
        <div>جاري التحميل...</div>
      ) : installments.length === 0 ? (
        <div className="text-center text-gray-500">لا يوجد عملاء مستحقين لهذا الشهر.</div>
      ) : (
        <ul className="space-y-4">
          {installments.map((item) => (
            <li key={item.id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-bold text-lg">{item.cast?.name}</div>
                <div className="text-gray-600">العنوان: {item.cast?.area || "-"}</div>
                <div className="text-gray-600">القسط رقم: {item.number} | القسط الشهري: {item.amount}</div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <Button variant="default" onClick={() => handleAction(item.id, "PAID")}>تم التحصيل</Button>
                <Button variant="destructive" onClick={() => handleAction(item.id, "POSTPONED")}>تأجيل القسط</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
