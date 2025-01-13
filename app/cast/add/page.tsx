"use client";
import router from "next/router";
import { useEffect, useState } from "react";

interface FormData {
  customerCode: string | number;
  monthDate: string;
  date: string;
  name: string;
  phone: string;
  k: string | number;
  t: string | number;
  otherProducts: string;
  advance: string | number;
  amount: string | number;
  installments: string | number;
  product: string;
  area: string;
  notes: string;
  status: string;
}

export default function AddCastPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerCode: "",
    monthDate: "",
    date: new Date().toISOString().split("T")[0],
    name: "",
    phone: "",
    k: "",
    t: "",
    otherProducts: "",
    advance: "",
    amount: "",
    installments: "",
    product: "",
    area: "",
    notes: "",
    status: "active",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    getNextCustomerCode();
  }, []);

  // دالة لمعرفة كود العميل الاخير وتضيف عليه 1
  const getNextCustomerCode = async () => {
    try {
      const response = await fetch("/api/cast/last-customer-code");
      const data = await response.json();
      const newCustomerCode = data.nextCode;
      setFormData((prev) => ({ ...prev, customerCode: newCustomerCode }));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const submissionData = {
        ...formData,
        customerCode:
          formData.customerCode === "" ? 0 : Number(formData.customerCode),
        k: formData.k === "" ? 0 : Number(formData.k),
        t: formData.t === "" ? 0 : Number(formData.t),
        advance: formData.advance === "" ? 0 : Number(formData.advance),
        amount: formData.amount === "" ? 0 : Number(formData.amount),
        installments:
          formData.installments === "" ? 0 : Number(formData.installments),
      }; 

      const response = await fetch("/api/cast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      // Reset form or redirect
      router.push("/cast");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">إضافة عميل جديد</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* <label className="block mb-2" >
            رقم العميل:
          </label> */}
          <input
            type="text"
            name="customerCode"
            value={formData.customerCode}
            onChange={handleChange}
            className="w-full p-2 border rounded text-right"
            hidden
          />
        </div>

        <div>
          <label className="block mb-2">الاسم:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        <div>
          <label className="block mb-2">رقم الهاتف:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
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

        <div>
          <label className="block mb-2">العنوان:</label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        {/* عدد الكراسى */}
        <div>
          <label className="block mb-2">عدد الكراسى:</label>
          <input
            type="text"
            name="k"
            value={formData.k}
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

        {/* عدد الترابيزة */}
        <div>
          <label className="block mb-2">عدد الترابيازت:</label>
          <input
            type="text"
            name="t"
            value={formData.t}
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

        {/* مبلغ المقدم */}
        <div>
          <label className="block mb-2">المقدم:</label>
          <input
            type="number"
            name="advance"
            value={formData.advance}
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

        <div>
          <label className="block mb-2">القسط الشهرى:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
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

        <div>
          <label className="block mb-2">عدد الأقساط:</label>
          <input
            type="number"
            name="installments"
            value={formData.installments}
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

        <div>
          <label className="block mb-2">ملاحظات:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded text-right"
            rows={4}
          />
        </div>

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
