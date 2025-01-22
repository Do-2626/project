"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface FormData {
  customerCode: number;
  monthDate: string;
  date: string;
  name: string;
  phone: string;
  k: number;
  t: number;
  otherProducts: string;
  advance: number;
  amount: number;
  installments: number;
  product: string;
  area: string;
  notes: string;
  status: string;
  latitude?: number;
  longitude?: number;
}

export default function AddCastPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FormData>>({
    date: new Date().toISOString().split("T")[0],
    status: "active",
  });

  // دالة لتحويل القيم الفارغة إلى أرقام
  const toNumber = (value: string | number): number => {
    return value === "" ? 0 : Number(value);
  };

  // دالة لجلب كود العميل التالي
  const getNextCustomerCode = useCallback(async () => {
    try {
      const response = await fetch("/api/cast/last-customer-code");
      if (!response.ok) {
        throw new Error("Failed to fetch customer code");
      }
      const data = await response.json();
      const newCustomerCode = data.nextCode;
      setFormData((prev) => ({ ...prev, customerCode: newCustomerCode }));
    } catch (error) {
      console.error("Error fetching customer code:", error);
      setError("فشل في جلب كود العميل");
    }
  }, []);

  // دالة لإرسال البيانات إلى الباك إند
  const submitFormData = useCallback(
    async (data: Partial<FormData>) => {
      try {
        const response = await fetch("/api/cast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "فشل في إرسال النموذج");
        }

        router.push("/cast");
      } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
      }
    },
    [router]
  );

  // دالة لإدارة عملية الإرسال
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
        // الحصول على الموقع الجغرافي
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error("Geolocation not supported"));
              return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );

        // تحضير البيانات للإرسال
        const submissionData = {
          ...formData,
          customerCode: toNumber(formData.customerCode || 0),
          k: toNumber(formData.k || 0),
          t: toNumber(formData.t || 0),
          advance: toNumber(formData.advance || 0),
          amount: toNumber(formData.amount || 0),
          installments: toNumber(formData.installments || 0),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        await submitFormData(submissionData);
      } catch (error) {
        console.error("Error:", error);
        setError("حدث خطأ أثناء إرسال النموذج");

        // إرسال البيانات بدون الموقع في حالة الفشل
        const submissionDataWithoutLocation = {
          ...formData,
          customerCode: toNumber(formData.customerCode || 0),
          k: toNumber(formData.k || 0),
          t: toNumber(formData.t || 0),
          advance: toNumber(formData.advance || 0),
          amount: toNumber(formData.amount || 0),
          installments: toNumber(formData.installments || 0),
          latitude: 0,
          longitude: 0,
        };

        await submitFormData(submissionDataWithoutLocation);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, submitFormData]
  );

  // دالة لإدارة تغييرات الحقول
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  // جلب كود العميل التالي عند تحميل الصفحة
  useEffect(() => {
    getNextCustomerCode();
  }, [getNextCustomerCode]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">إضافة عميل جديد</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* الحقول المخفية */}
        <input
          type="text"
          name="customerCode"
          value={formData.customerCode || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded text-right"
          hidden
        />

        {/* حقل الاسم */}
        <div>
          <label className="block mb-2">الاسم:</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        {/* حقل رقم الهاتف */}
        <div>
          <label className="block mb-2">رقم الهاتف:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ""}
            onChange={(e) => {
              if (!/^\d*$/.test(e.target.value)) {
                alert("الرجاء إدخال أرقام فقط");
                return;
              }
              handleChange(e);
            }}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        {/* حقل العنوان */}
        <div>
          <label className="block mb-2">العنوان:</label>
          <input
            type="text"
            name="area"
            value={formData.area || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        {/* حقل عدد الكراسي */}
        <div>
          <label className="block mb-2">عدد الكراسي:</label>
          <input
            type="number"
            name="k"
            value={formData.k || ""}
            onChange={(e) => {
              if (!/^\d*$/.test(e.target.value)) {
                alert("الرجاء إدخال أرقام فقط");
                return;
              }
              handleChange(e);
            }}
            className="w-full p-2 border rounded text-right"
          />
        </div>

        {/* حقل عدد الترابيزات */}
        <div>
          <label className="block mb-2">عدد الترابيزات:</label>
          <input
            type="number"
            name="t"
            value={formData.t || ""}
            onChange={(e) => {
              if (!/^\d*$/.test(e.target.value)) {
                alert("الرجاء إدخال أرقام فقط");
                return;
              }
              handleChange(e);
            }}
            className="w-full p-2 border rounded text-right"
          />
        </div>

        {/* حقل المقدم */}
        <div>
          <label className="block mb-2">المقدم:</label>
          <input
            type="number"
            name="advance"
            value={formData.advance || ""}
            onChange={(e) => {
              if (!/^\d*$/.test(e.target.value)) {
                alert("الرجاء إدخال أرقام فقط");
                return;
              }
              handleChange(e);
            }}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        {/* حقل القسط الشهري */}
        <div>
          <label className="block mb-2">القسط الشهري:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount || ""}
            onChange={(e) => {
              if (!/^\d*$/.test(e.target.value)) {
                alert("الرجاء إدخال أرقام فقط");
                return;
              }
              handleChange(e);
            }}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        {/* حقل عدد الأقساط */}
        <div>
          <label className="block mb-2">عدد الأقساط:</label>
          <input
            type="number"
            name="installments"
            value={formData.installments || ""}
            onChange={(e) => {
              if (!/^\d*$/.test(e.target.value)) {
                alert("الرجاء إدخال أرقام فقط");
                return;
              }
              handleChange(e);
            }}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        {/* حقل المنتج */}
        <div>
          <label className="block mb-2">المنتج:</label>
          <input
            type="text"
            name="product"
            value={formData.product || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        {/* حقل الملاحظات */}
        <div>
          <label className="block mb-2">ملاحظات:</label>
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded text-right"
            rows={4}
          />
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:bg-gray-400"
        >
          {isLoading ? "جاري الإرسال..." : "إضافة عميل"}
        </button>
      </form>
    </div>
  );
}

// return (
//   <div className="container mx-auto p-4">
//     <h1 className="text-2xl font-bold mb-4">إضافة عميل جديد</h1>
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         {/* <label className="block mb-2" >
//           رقم العميل:
//         </label> */}
//         <input
//           type="text"
//           name="customerCode"
//           value={formData.customerCode}
//           onChange={handleChange}
//           className="w-full p-2 border rounded text-right"
//           hidden
//         />
//       </div>

//       <div>
//         <label className="block mb-2">الاسم:</label>
//         <input
//           type="text"
//           name="name"
//           value={formData.name}
//           onChange={handleChange}
//           className="w-full p-2 border rounded text-right"
//           required
//         />
//       </div>

//       <div>
//         <label className="block mb-2">رقم الهاتف:</label>
//         <input
//           type="tel"
//           name="phone"
//           value={formData.phone}
//           onChange={(e) => {
//             if (!/^\d*$/.test(e.target.value)) {
//               alert("الرجاء إدخال أرقام فقط");
//               return;
//             }
//             handleChange(e);
//           }}
//           className="w-full p-2 border rounded text-right"
//           required
//         />
//       </div>

//       <div>
//         <label className="block mb-2">العنوان:</label>
//         <input
//           type="text"
//           name="area"
//           value={formData.area}
//           onChange={handleChange}
//           className="w-full p-2 border rounded text-right"
//           required
//         />
//       </div>

//       {/* عدد الكراسى */}
//       <div>
//         <label className="block mb-2">عدد الكراسى:</label>
//         <input
//           type="text"
//           name="k"
//           value={formData.k}
//           onChange={(e) => {
//             if (!/^\d*$/.test(e.target.value)) {
//               alert("الرجاء إدخال أرقام فقط");
//               return;
//             }
//             handleChange(e);
//           }}
//           className="w-full p-2 border rounded text-right"
//         />
//       </div>

//       {/* عدد الترابيزة */}
//       <div>
//         <label className="block mb-2">عدد الترابيازت:</label>
//         <input
//           type="text"
//           name="t"
//           value={formData.t}
//           onChange={(e) => {
//             if (!/^\d*$/.test(e.target.value)) {
//               alert("الرجاء إدخال أرقام فقط");
//               return;
//             }
//             handleChange(e);
//           }}
//           className="w-full p-2 border rounded text-right"
//         />
//       </div>

//       {/* مبلغ المقدم */}
//       <div>
//         <label className="block mb-2">المقدم:</label>
//         <input
//           type="number"
//           name="advance"
//           value={formData.advance}
//           onChange={(e) => {
//             if (!/^\d*$/.test(e.target.value)) {
//               alert("الرجاء إدخال أرقام فقط");
//               return;
//             }
//             handleChange(e);
//           }}
//           className="w-full p-2 border rounded text-right"
//           required
//         />
//       </div>

//       <div>
//         <label className="block mb-2">القسط الشهرى:</label>
//         <input
//           type="number"
//           name="amount"
//           value={formData.amount}
//           onChange={(e) => {
//             if (!/^\d*$/.test(e.target.value)) {
//               alert("الرجاء إدخال أرقام فقط");
//               return;
//             }
//             handleChange(e);
//           }}
//           className="w-full p-2 border rounded text-right"
//           required
//         />
//       </div>

//       <div>
//         <label className="block mb-2">عدد الأقساط:</label>
//         <input
//           type="number"
//           name="installments"
//           value={formData.installments}
//           onChange={(e) => {
//             if (!/^\d*$/.test(e.target.value)) {
//               alert("الرجاء إدخال أرقام فقط");
//               return;
//             }
//             handleChange(e);
//           }}
//           className="w-full p-2 border rounded text-right"
//           required
//         />
//       </div>

//       <div>
//         <label className="block mb-2">ملاحظات:</label>
//         <textarea
//           name="notes"
//           value={formData.notes}
//           onChange={handleChange}
//           className="w-full p-2 border rounded text-right"
//           rows={4}
//         />
//       </div>

//       <button
//         type="submit"
//         disabled={isLoading}
//         className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:bg-gray-400"
//       >
//         {isLoading ? "جاري الإرسال..." : "إضافة عميل"}
//       </button>
//     </form>
//   </div>
// );
