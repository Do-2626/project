import React, { useState } from "react";
import PasswordPrompt from "./PasswordPrompt";
import BulkTransactionTable from "@/app/inventory/components/BulkTransactionTable";

export default function Modal({ open, type, onClose, onSuccess, products, selectedDate, transactionId, onDeleteConfirm, dailyReport }: any) {
  const [form, setForm] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  // جلب الفروع عند فتح النافذة
  React.useEffect(() => {
    if (open) {
      setQuantities({});
      setAmounts({});
      setForm({});
      fetch("/api/branches")
        .then((res) => res.json())
        .then((data) => setBranches(data))
        .catch((err) => console.error("Failed to fetch branches", err));
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));

    // تحديث السعر تلقائياً إذا كان بيعاً
    if (type === "sale") {
      const product = products.find((p: any) => p._id === productId);
      if (product && product.sellingPrice) {
        setAmounts((prev) => ({
          ...prev,
          [productId]: quantity * product.sellingPrice,
        }));
      }
    }
  };

  const handleAmountChange = (productId: string, amount: number) => {
    setAmounts((prev) => ({
      ...prev,
      [productId]: amount,
    }));
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
    } else if (type !== "delete") {
      // إعداد البيانات للإرسال الجماعي
      const transactionsToSubmit = [];
      const branchName = form.branchId 
        ? branches.find(b => b._id === form.branchId)?.name 
        : form.party;

      for (const [productId, quantity] of Object.entries(quantities)) {
        if (quantity > 0) {
          const product = products.find((p: any) => p._id === productId);
          const transaction: any = {
            productId,
            quantity,
            type,
            party: branchName, // استخدام اسم الفرع كجهة
            branchId: form.branchId,
            date: selectedDate,
          };
          
          if (type === "purchase" && product) {
             // حساب المبلغ تلقائياً للمشتريات (الكمية * سعر الشراء)
             transaction.amount = quantity * (product.purchasePrice || 0);
          } else if (type === "sale" && product) {
             // استخدام المبلغ المدخل يدوياً أو الحساب التلقائي كاحتياطي
             transaction.amount = amounts[productId] !== undefined && amounts[productId] !== 0
               ? amounts[productId]
               : quantity * (product.sellingPrice || 0);
             
             // تنبيه إذا كان السعر صفراً
             if (transaction.amount === 0) {
               console.warn(`Product ${product.name} has no amount defined.`);
             }
          }
          
          transactionsToSubmit.push(transaction);
        }
      }

      if (transactionsToSubmit.length === 0) {
        alert("يرجى إدخال كمية لمنتج واحد على الأقل");
        return;
      }

      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionsToSubmit),
      });
    }
    onSuccess();
  };

  // دالة نجاح التحقق
  function handlePasswordSuccess() {
    setShowPassword(true);
  }

  // حقول إضافة صنف
  const addProductFields = (
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

  // حقول العمليات
  const transactionFields = (
    <>
      {/* اختيار الفرع أو الجهة - مشترك لجميع العمليات */}
      {(type === "outgoing" || type === "incoming" || type === "damaged" || type === "purchase" || type === "sale") ? (
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-300">الفرع / الجهة</label>
          <select 
            name="branchId" 
            onChange={handleChange} 
            className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
            required={type !== "purchase" && type !== "sale"} // الشراء والبيع قد لا يكون من فرع
          >
            <option value="">اختر الفرع</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
           {/* خيار إدخال يدوي للجهة في حالة الشراء أو إذا لم يكن فرعاً */}
           {!form.branchId && (
            <input 
              name="party" 
              onChange={handleChange} 
              className="mt-2 bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" 
              placeholder="أو أدخل اسم الجهة يدوياً" 
            />
           )}
        </div>
      ) : (
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-300">الجهة (المورد/المندوب/سبب التلف...)</label>
          <input name="party" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" placeholder="اسم الجهة (اختياري)" />
        </div>
      )}

      {/* جدول المنتجات للإدخال الجماعي */}
      <BulkTransactionTable 
        products={products}
        dailyReport={dailyReport}
        type={type}
        quantities={quantities}
        amounts={amounts}
        onQuantityChange={handleQuantityChange}
        onAmountChange={handleAmountChange}
      />
    </>
  );

  let body = null;
  if (type === "addProduct") {
    if (!showPassword) {
      body = (
        <PasswordPrompt
          onSuccess={handlePasswordSuccess}
          label="كلمة المرور لإضافة صنف جديد"
          buttonText="تأكيد"
        />
      );
    } else {
      body = addProductFields;
    }
  } else if (type === "delete") {
    body = (
      <div className="text-white text-center">
        <p className="mb-4">هل أنت متأكد أنك تريد حذف هذه العملية؟</p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onDeleteConfirm(transactionId)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            تأكيد الحذف
          </button>
        </div>
      </div>
    );
  } else {
    body = transactionFields;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`bg-gray-800 rounded-lg shadow-xl w-[95%] ${type === 'delete' || type === 'addProduct' ? 'max-w-[500px]' : 'max-w-4xl'} p-4 mx-2 modal-content scale-95`}>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h3 className="text-xl font-semibold">{type === "addProduct" ? "إضافة صنف جديد" : type === "delete" ? "تأكيد الحذف" : "تسجيل عملية"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        {type !== "delete" ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">{body}</div>
            <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-700">
              <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">إلغاء</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300" disabled={type === "addProduct" && !showPassword}>حفظ</button>
            </div>
          </form>
        ) : (
          body
        )}
      </div>
    </div>
  );
}
