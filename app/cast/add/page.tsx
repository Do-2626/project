"use client";
import router from "next/router";
import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";

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
}

export default function AddCastPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerCode: 0,
    monthDate: "",
    date: new Date().toISOString().split("T")[0],
    name: "",
    phone: "",
    k: 0,
    t: 0,
    otherProducts: "",
    advance: 0,
    amount: 0,
    installments: 0,
    product: "",
    area: "",
    notes: "",
    status: "active",
  });

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
    console.log(
      "🚀 ~ file: page.tsx ~ line 100 ~ handleSubmit ~ formData",
      formData
    );

    try {
      const response = await fetch("/api/cast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      const data = await response.json();
      router.push("/cast"); // Redirect after success
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "k" ||
          name === "t" ||
          name === "advance" ||
          name === "amount" ||
          name === "installments"
            ? Number(value)
            : value,
      }));
    }, 300),
    []
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">إضافة عميل جديد</h1>

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
            onChange={handleChange}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        <div>
          <label className="block mb-2">المنتج:</label>
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleChange}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        <div>
          <label className="block mb-2">المبلغ:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
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
            onChange={handleChange}
            className="w-full p-2 border rounded text-right"
            required
          />
        </div>

        <div>
          <label className="block mb-2">المنطقة:</label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
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
