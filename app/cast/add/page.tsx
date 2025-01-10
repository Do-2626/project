"use client";
import { useState } from "react";

interface CastData {
  customerCode: string;
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
  collectedInstallmentNumber: number;
  printStatus: string;
  upcomingCollectionAmount: number;
  nextInstallment: number;
  piecePrice: number;
  status: string;
  column2: number;
  delayInMonths: number;
  paidFromNextInstallment: string;
}

export default function CastForm() {
  const [formData, setFormData] = useState<CastData>({
    customerCode: "",
    monthDate: "",
    date: "",
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
    collectedInstallmentNumber: 0,
    printStatus: "",
    upcomingCollectionAmount: 0,
    nextInstallment: 0,
    piecePrice: 0,
    status: "",
    column2: 0,
    delayInMonths: 0,
    paidFromNextInstallment: "",
  });

  return (
    <form className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        {/* معلومات العميل الأساسية */}
        <div className="col-span-2 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">معلومات العميل</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="كود العميل"
                value={formData.customerCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerCode: e.target.value,
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="الاسم"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="المنطقة"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* تفاصيل المنتج والمدفوعات */}
        <div className="col-span-2 bg-gray-50 p-4 rounded">
          <h2 className="text-xl mb-4">تفاصيل المنتج والمدفوعات</h2>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="المنتج"
              value={formData.product}
              onChange={(e) =>
                setFormData({ ...formData, product: e.target.value })
              }
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="المبلغ"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: Number(e.target.value) })
              }
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="المقدم"
              value={formData.advance}
              onChange={(e) =>
                setFormData({ ...formData, advance: Number(e.target.value) })
              }
              className="p-2 border rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          className="col-span-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          حفظ البيانات
        </button>
      </div>
    </form>
  );
}
