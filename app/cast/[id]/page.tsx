"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { CastData } from "@/lib/types";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// نوع بيانات القسط
interface Payment {
  id?: string;
  castId: string;
  number: number;
  amount: number;
  date: string;
}

export default function CastDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cast, setCast] = useState<CastData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const castData = searchParams.get("data");
    if (castData) {
      let parsedData = JSON.parse(castData) as CastData;
      // تحويل اسم الحقل من installments إلى installmentCount إذا كان موجودًا
      if (parsedData.installments && !parsedData.installmentCount) {
        parsedData.installmentCount = parsedData.installments;
      }
      setCast(parsedData);
      setFormData(parsedData);
      setIsLoading(false);
    } else {
      setError("بيانات العميل غير متوفرة");
      setIsLoading(false);
    }
  }, [searchParams]);

  // جلب الأقساط من API
  useEffect(() => {
    if (!cast?._id) return;
    const fetchPayments = async () => {
      try {
        const res = await fetch(`/api/payments?castId=${cast._id}`);
        const data = await res.json();
        if (data.success) setPayments(data.data);
      } catch (e) {
        setError("تعذر تحميل الأقساط");
      }
    };
    fetchPayments();
  }, [cast?._id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return null;
      // إذا كان الحقل رقميًا، تأكد من التحويل الصحيح وتجنب NaN
      if (
        [
          "k",
          "t",
          "advance",
          "amount",
          "installmentCount",
          "longitude",
          "latitude",
          "next",
        ].includes(name)
      ) {
        const num = Number(value);
        return {
          ...prev,
          [name]: value === "" ? undefined : isNaN(num) ? undefined : num,
        } as CastData;
      }
      return {
        ...prev,
        [name]: value,
      } as CastData;
    });
  };

  const handleEdit = () => {
    if (cast) {
      setFormData({ ...cast }); // نسخ البيانات لتجنب تعديل الحالة الأصلية مباشرة
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(cast ? { ...cast } : null); // إعادة تعيين البيانات عند الإلغاء
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      if (!formData) {
        console.log("[handleSave] لا يوجد بيانات formData");
        return;
      }
      // تأكد من إرسال الحقول المتوافقة مع قاعدة البيانات
      const payload = {
        ...formData,
        installments: formData.installmentCount ?? formData.installments,
      };
      console.log("[handleSave] payload to send:", payload);
      const response = await fetch(`/api/cast/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("[handleSave] response.ok:", response.ok);
      if (!response.ok) {
        const errorText = await response.text();
        console.log("[handleSave] response error text:", errorText);
        throw new Error("فشل في حفظ البيانات");
      }
      const updated = await response.json();
      console.log("[handleSave] updated from server:", updated);
      setCast(updated);
      setFormData({ ...updated }); // تحديث formData أيضًا
      setIsEditing(false);
    } catch (err) {
      console.log("[handleSave] catch error:", err);
      setError("حدث خطأ أثناء الحفظ");
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      return;
    }

    // Prompt for password
    const password = prompt("الرجاء إدخال كلمة المرور للتأكيد");

    // Check if password is correct (you may want to change this to a more secure password)
    if (password !== "admin2626") {
      setError("كلمة المرور غير صحيحة");
      return;
    }

    try {
      const response = await fetch(`/api/cast/${params.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      // Redirect to customers list after successful deletion
      router.push("/cast");
    } catch (error) {
      console.error("Error deleting cast:", error);
      // Show error message to user
      setError("فشل في حذف العميل");
    }
  };

  // حساب الأقساط المدفوعة والمتبقية
  const paidCount = payments.length;
  const remainingInstallments =
    Number(formData?.installmentCount ?? 0) - paidCount;
  const nextInstallmentNumber = paidCount + 1;

  // تحصيل القسط التالي
  const handlePayInstallment = async () => {
    if (!cast?._id || !formData?.amount) return;
    if (paidCount >= Number(formData.installmentCount)) {
      setError("تم دفع جميع الأقساط");
      return;
    }
    setIsPaying(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      // منع تكرار الدفع في نفس اليوم
      if (payments.some((p) => p.date === today)) {
        setError("تم دفع قسط اليوم بالفعل");
        setIsPaying(false);
        return;
      }
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          castId: cast._id,
          number: nextInstallmentNumber,
          amount: formData.amount,
          date: today,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "فشل التحصيل");
      setPayments((prev) => [...prev, data.data]);
      setError(null);
    } catch (e: any) {
      setError(e.message || "فشل التحصيل");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* رأس الصفحة مع صورة أو أيقونة */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl text-blue-600 shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118A7.5 7.5 0 0112 15.75a7.5 7.5 0 017.5 4.368"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1 text-center md:text-right">
          <h1 className="text-3xl font-bold mb-1 flex items-center justify-center md:justify-end gap-2">
            <span>تفاصيل العميل</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </h1>
          <p className="text-muted-foreground text-lg">
            {formData?.name ?? "-"}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            رقم الهاتف: {formData?.phone ?? "-"}
          </p>
        </div>
      </div>

      {/* إشعار تحديث الموقع الجغرافي */}
      {(!formData?.latitude || !formData?.longitude) && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>الموقع الجغرافي غير متوفر</AlertTitle>
          <AlertDescription>
            لم يتم تسجيل الموقع الجغرافي لهذا العميل. يرجى الضغط على زر "تحديث
            الموقع" لإضافة الموقع الحالي.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* بيانات أساسية */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            بيانات العميل
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <span className="font-medium">العنوان:</span>
              {isEditing ? (
                <Input
                  name="area"
                  value={formData?.area ?? ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <span className="ml-2">{formData?.area ?? "-"}</span>
              )}
            </div>
            <div>
              <span className="font-medium">عدد الكراسي:</span>
              {isEditing ? (
                <Input
                  name="k"
                  value={formData?.k ?? ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <span className="ml-2">{formData?.k ?? "-"}</span>
              )}
            </div>
            <div>
              <span className="font-medium">عدد الترابيزات:</span>
              {isEditing ? (
                <Input
                  name="t"
                  value={formData?.t ?? ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <span className="ml-2">{formData?.t ?? "-"}</span>
              )}
            </div>
            <div>
              <span className="font-medium">تاريخ البداية:</span>
              {isEditing ? (
                <Input
                  name="date"
                  type="date"
                  value={formData?.date ?? ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <span className="ml-2">{formData?.date ?? "-"}</span>
              )}
            </div>
            <div>
              <span className="font-medium">المنتج:</span>
              {isEditing ? (
                <Input
                  name="product"
                  value={formData?.product ?? ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <span className="ml-2">{formData?.product ?? "-"}</span>
              )}
            </div>
            <div>
              <span className="font-medium">ملاحظات:</span>
              {isEditing ? (
                <Input
                  name="notes"
                  value={formData?.notes ?? ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <span className="ml-2">
                  {formData?.notes || (
                    <span className="text-gray-400">لا يوجد</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* بيانات مالية */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4"
              />
            </svg>
            بيانات الأقساط
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <span className="font-medium">المقدم:</span>
              {isEditing ? (
                <Input
                  name="advance"
                  value={formData?.advance ?? ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <span className="ml-2">{formData?.advance ?? "-"}</span>
              )}
            </div>
            <div>
              <span className="font-medium">المبلغ:</span>
              {isEditing ? (
                <Input
                  name="amount"
                  value={formData?.amount ?? ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <span className="ml-2">{formData?.amount ?? "-"}</span>
              )}
            </div>
            <div>
              <span className="font-medium">عدد الأقساط:</span>
              {isEditing ? (
                <Input
                  name="installmentCount"
                  value={formData?.installmentCount ?? ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <span className="ml-2">
                  {formData?.installmentCount ?? "-"}
                </span>
              )}
            </div>
            <div>
              <span className="font-medium">القسط التالي:</span>
              <span className="ml-2">{formData?.next ?? "-"}</span>
            </div>
            <div>
              <span className="font-medium">عدد الأقساط المتبقية:</span>
              <span className="ml-2">
                {isNaN(remainingInstallments) ? "-" : remainingInstallments}
              </span>
            </div>
            <div>
              <span className="font-medium">مجموع المبلغ المتبقي:</span>
              <span className="ml-2">
                {formData &&
                !isNaN(Number(formData.amount)) &&
                !isNaN(Number(formData.installmentCount)) &&
                !isNaN(Number(formData.next))
                  ? Number(formData.amount) *
                    (Number(formData.installmentCount) -
                      Number(formData.next) +
                      1)
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* الموقع الجغرافي */}
      <div className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 0c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5z"
            />
          </svg>
          الموقع الجغرافي
        </h2>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <Input
              id="longitude"
              name="longitude"
              value={
                formData?.longitude === undefined ||
                isNaN(Number(formData?.longitude))
                  ? ""
                  : formData?.longitude
              }
              onChange={handleInputChange}
              disabled={true}
              className="w-full"
              placeholder="خط الطول"
            />
            <Input
              id="latitude"
              name="latitude"
              value={
                formData?.latitude === undefined ||
                isNaN(Number(formData?.latitude))
                  ? ""
                  : formData?.latitude
              }
              onChange={handleInputChange}
              disabled={true}
              className="w-full"
              placeholder="خط العرض"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    setFormData((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                      };
                    });
                  });
                }
              }}
              type="button"
              disabled={!isEditing}
              variant="outline"
            >
              تحديث الموقع
            </Button>
          </div>
        </div>
      </div>

      {/* الإجراءات */}
      <div className="flex flex-wrap gap-4 justify-end mb-8">
        {isEditing ? (
          <>
            <Button onClick={handleCancelEdit} variant="outline">
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600"
            >
              حفظ
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handlePayInstallment}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={
                isPaying || paidCount >= Number(formData?.installmentCount)
              }
            >
              {isPaying ? "جاري التحصيل..." : "تحصيل القسط التالى"}
            </Button>
            <Button onClick={() => setShowAccountModal(true)} variant="outline">
              كشف حساب العميل
            </Button>
            <Button onClick={handleEdit} variant="secondary">
              تعديل
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              حذف
            </Button>
          </>
        )}
      </div>

      {/* نافذة منبثقة بسيطة لعرض كشف الحساب */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-center">
              كشف حساب العميل
            </h2>
            <div className="overflow-x-auto">
              <h3 className="font-semibold mb-2">
                الأقساط المدفوعة للعميل: {cast?.name}
              </h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border p-2">رقم القسط</th>
                    <th className="border p-2">المبلغ</th>
                    <th className="border p-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-2">
                        لا يوجد أقساط مدفوعة
                      </td>
                    </tr>
                  ) : (
                    payments
                      .sort((a, b) => a.number - b.number)
                      .map((p) => (
                        <tr key={p.number}>
                          <td className="border p-2">{p.number}</td>
                          <td className="border p-2">{p.amount}</td>
                          <td className="border p-2">{p.date}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
            <button
              className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded w-full"
              onClick={() => setShowAccountModal(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
