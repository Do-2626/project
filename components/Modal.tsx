import React, { useState } from "react";

export default function Modal({ open, type, onClose, onSuccess, products, selectedDate }: any) {
  const [form, setForm] = useState<any>({});
  if (!open) return null;

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (type === "addProduct") {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          weight: form.weight,
          purchasePrice: Number(form.purchasePrice),
          sellingPrice: Number(form.sellingPrice),
        }),
      });
    } else {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.productId,
          quantity: Number(form.quantity),
          type,
          party: form.party,
          date: selectedDate,
        }),
      });
    }
    onSuccess();
  };

  let body = null;
  if (type === "addProduct") {
    body = (
      <>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">اسم الصنف</label>
          <input name="name" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" required />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">الوزن (اختياري)</label>
          <input name="weight" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">سعر الشراء</label>
          <input name="purchasePrice" type="number" step="0.01" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" required />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">سعر البيع</label>
          <input name="sellingPrice" type="number" step="0.01" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" required />
        </div>
      </>
    );
  } else {
    body = (
      <>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">اختر الصنف</label>
          <select name="productId" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" required>
            <option value="">اختر</option>
            {products.map((p: any) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">الكمية</label>
          <input name="quantity" type="number" min="1" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" required />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">الجهة (المورد/المندوب/سبب التلف...)</label>
          <input name="party" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" placeholder="اسم الجهة (اختياري)" />
        </div>
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 modal-content scale-95">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h3 className="text-xl font-semibold">{type === "addProduct" ? "إضافة صنف جديد" : "تسجيل عملية"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">{body}</div>
          <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-700">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">إلغاء</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
}
