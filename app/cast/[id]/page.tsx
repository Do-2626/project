"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CastData } from "@/lib/types";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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

  const handleSave = async () => {
    try {
      // هنا يمكنك تحديث البيانات المحلية أو إرسالها إلى الخادم إذا لزم الأمر
      setCast(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating cast:", error);
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

  const remainingInstallments =
    Number(formData?.installmentCount) - Number(formData?.next ?? 0);

  return (
    <div className="container mx-auto px-4 py-8">
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
                  {Array.from({ length: cast?.next || 0 }, (_, i) => (
                    <tr key={i}>
                      <td className="border p-2">{i + 1}</td>
                      <td className="border p-2">{cast?.amount}</td>
                      <td className="border p-2">-</td>
                    </tr>
                  ))}
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
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* العنوان */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              تفاصيل العميل
            </h1>
            <p className="text-muted-foreground">عرض وتعديل بيانات العميل</p>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            رجوع
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* البيانات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* الاسم */}
          <div className="space-y-2">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              name="name"
              value={formData?.name ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          {/* رقم الهاتف */}
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              value={formData?.phone ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          {/* العنوان */}
          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              name="area"
              value={formData?.area ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          {/* عدد الكراسى */}
          <div className="space-y-2">
            <Label htmlFor="k">عدد الكراسى</Label>
            <Input
              id="k"
              name="k"
              value={
                formData?.k === undefined || isNaN(Number(formData?.k))
                  ? ""
                  : formData?.k
              }
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          {/* عدد الترابيزات */}
          <div className="space-y-2">
            <Label htmlFor="t">عدد الترابيزات</Label>
            <Input
              id="t"
              name="t"
              value={
                formData?.t === undefined || isNaN(Number(formData?.t))
                  ? ""
                  : formData?.t
              }
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          {/* تاريخ البيع */}
          <div className="space-y-2">
            <Label htmlFor="date">تاريخ البداية</Label>
            <Input
              id="date"
              name="date"
              value={formData?.date ?? ""}
              onChange={handleInputChange}
              disabled={true}
              className="w-full"
            />
          </div>

          {/* معلومات الدفع */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* المقدم */}
            <div className="space-y-2">
              <Label htmlFor="advance">المقدم</Label>
              <Input
                id="advance"
                name="advance"
                value={
                  formData?.advance === undefined ||
                  isNaN(Number(formData?.advance))
                    ? ""
                    : formData?.advance
                }
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full"
              />
            </div>

            {/* المبلغ */}
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                name="amount"
                value={
                  formData?.amount === undefined ||
                  isNaN(Number(formData?.amount))
                    ? ""
                    : formData?.amount
                }
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full"
              />
            </div>

            {/* عدد الاقساط */}
            <div className="space-y-2">
              <Label htmlFor="installmentCount">عدد الاقساط</Label>
              <Input
                id="installmentCount"
                name="installmentCount"
                value={
                  formData?.installmentCount === undefined ||
                  isNaN(Number(formData?.installmentCount))
                    ? ""
                    : formData?.installmentCount
                }
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
          </div>

          {/* الموقع الجغرافى */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <Label>الموقع الجغرافى</Label>
            <div className="flex flex-col md:flex-row gap-4">
              {/* خط الطول */}
              <div className="flex-1">
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
                />
              </div>

              {/* خط العرض */}
              <div className="flex-1">
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

          {/* القسط التالى */}
          <div className="space-y-2">
            <Label htmlFor="nextInstallment">القسط التالى</Label>
            <Input
              id="nextInstallment"
              name="nextInstallment"
              value={
                formData?.next === undefined || isNaN(Number(formData?.next))
                  ? ""
                  : formData?.next
              }
              onChange={handleInputChange}
              disabled={true}
              className="w-full"
            />
          </div>

          {/* مجموع الاقساط المتبقية */}
          <div className="space-y-2">
            <Label htmlFor="remainingAmount">عدد الاقساط المتبقية</Label>
            <Input
              id="remainingAmount"
              name="remainingAmount"
              value={
                isNaN(remainingInstallments) ? "" : remainingInstallments
              }
              onChange={handleInputChange}
              disabled={true}
              className="w-full"
            />
          </div>

          {/* مجموع المبلغ المتبقى */}
          <div className="space-y-2">
            <Label htmlFor="remainingAmount">مجموع المبلغ المتبقى</Label>
            <Input
              id="remainingAmount"
              name="remainingAmount"
              value={
                formData && !isNaN(Number(formData.amount)) && !isNaN(Number(formData.installmentCount)) && !isNaN(Number(formData.next))
                  ? Number(formData.amount) * (Number(formData.installmentCount) - Number(formData.next) + 1)
                  : ""
              }
              onChange={handleInputChange}
              disabled={true}
              className="w-full"
            />
          </div>

          {/* المنتج */}
          <div className="space-y-2">
            <Label htmlFor="product">المنتج</Label>
            <Input
              id="product"
              name="product"
              value={formData?.product ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          {/* الملاحظات */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">الملاحظات</Label>
            <Input
              id="notes"
              name="notes"
              value={formData?.notes ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>
        </div>

        {/* الاجراءات */}
        <div className="flex flex-col md:flex-row justify-end gap-4 mt-8">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="outline">
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
              {/* اصدار ايصال بالقسط التالى */}
              <Button
                onClick={() => {
                  router.push(`/cast/receipt/${params.id}`);
                }}
              >
                اصدار ايصال بالقسط التالى
              </Button>
              {/* عرض الاقساط السابقة */}
              <Button
                onClick={() => setShowAccountModal(true)}
                variant="outline"
              >
                كشف حساب العميل
              </Button>

              {/* تعديل */}
              <Button onClick={() => setIsEditing(true)} variant="outline">
                تعديل
              </Button>

              {/* حذف */}
              <Button onClick={handleDelete} variant="destructive">
                حذف
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
