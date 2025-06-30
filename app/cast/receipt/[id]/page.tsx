"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Payment {
  id?: string;
  castId: string;
  number: number;
  amount: number;
  date: string;
}

export default function ReceiptPage() {
  const params = useParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLastPayment = async () => {
      try {
        // جلب جميع الأقساط للعميل
        const res = await fetch(`/api/payments?castId=${params.id}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "فشل في جلب الأقساط");
        // الحصول على آخر قسط مدفوع
        const sorted = data.data.sort(
          (a: Payment, b: Payment) => b.number - a.number
        );
        setPayment(sorted[0] || null);
      } catch (e: any) {
        setError(e.message || "فشل في جلب بيانات الإيصال");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchLastPayment();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!payment) return <div>لا يوجد إيصال متاح لهذا العميل.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        إيصال القسط الأخير للعميل #{params.id}
      </h1>
      <div className="flex justify-between mb-4">
        <div>
          <p>رقم القسط: {payment.number}</p>
          <p>معرف العميل: {payment.castId}</p>
        </div>
        <div>
          <p>التاريخ: {payment.date}</p>
          <p>المبلغ: {payment.amount}</p>
        </div>
      </div>
      {/* يمكن إضافة تفاصيل إضافية هنا */}
    </div>
  );
}
