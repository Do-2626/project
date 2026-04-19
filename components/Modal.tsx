import React, { useState } from "react";
import {
  FaArrowUp, FaArrowDown, FaCartPlus, FaWallet, FaBan, FaRightLeft, FaXmark
} from "react-icons/fa6";
import PasswordPrompt from "./PasswordPrompt";
import BulkTransactionTable from "@/app/inventory/components/BulkTransactionTable";

const typeLabels: Record<string, string> = {
  outgoing: "تسجيل عملية تحميل",
  incoming: "تسجيل عملية مرتجع",
  purchase: "تسجيل عملية شراء",
  transfer: "تسجيل عملية تحويل",
  dailyExpense: "تسجيل مصروف",
  damaged: "تسجيل عملية تالف",
  addProduct: "إضافة صنف جديد",
  delete: "تأكيد الحذف",
  operationSelector: "إضافة عملية جديدة",
  sale: "تسجيل عملية بيع"
};

export default function Modal({ open, type, onClose, onSuccess, products, selectedDate, transactionId, onDeleteConfirm, dailyReport, onSelectType }: any) {
  const [form, setForm] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [contacts, setContacts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<Record<string, any>>({}); // لتخزين المنتجات الجديدة

  // جلب الفروع عند فتح النافذة
  React.useEffect(() => {
    if (open) {
      setQuantities({});
      setAmounts({});
      setForm({});
      setNewProducts({});
      setShowPassword(false);
      fetch("/api/branches")
        .then((res) => res.json())
        .then((data) => setBranches(data))
        .catch((err) => console.error("Failed to fetch branches", err));

      fetch("/api/expense-categories")
        .then((res) => res.json())
        .then((data) => setExpenseCategories(data))
        .catch((err) => console.error("Failed to fetch expense categories", err));

      fetch("/api/contacts")
        .then((res) => res.json())
        .then((data) => setContacts(data))
        .catch((err) => console.error("Failed to fetch contacts", err));
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    // تحويل المعرف إلى string بشكل صريح لتجنب مشاكل التطابق
    const key = String(productId);
    setQuantities((prev) => ({
      ...prev,
      [key]: quantity,
    }));

    // تحديث السعر تلقائياً إذا كان بيعاً
    if (type === "sale") {
      const product = products.find((p: any) => String(p._id) === key);
      if (product && product.sellingPrice) {
        setAmounts((prev) => ({
          ...prev,
          [key]: quantity * product.sellingPrice,
        }));
      }
    }
  };

  const handleAmountChange = (productId: string, amount: number) => {
    const key = String(productId);
    setAmounts((prev) => ({
      ...prev,
      [key]: amount,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (type === "addProduct") {
      // جمع المنتجات الجديدة
      const productsToAdd = Object.values(newProducts).filter(p => p.name && p.purchasePrice && p.sellingPrice);
      
      if (productsToAdd.length === 0) {
        alert("يرجى إضافة منتج واحد على الأقل");
        return;
      }

      // إرسال جميع المنتجات دفعة واحدة
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productsToAdd),
      });
    } else if (type === "dailyExpense") {
      const selectedCategory = expenseCategories.find(c => c._id === form.expenseCategoryId);
      const categoryName = selectedCategory ? selectedCategory.name : "أخرى";

      const expenseData = {
        type: "expense",
        amount: Number(form.amount),
        category: categoryName,
        expenseCategoryId: form.expenseCategoryId || null,
        expenseSubtype: form.expenseSubtype || "",
        description: form.description || "",
        date: selectedDate,
        branchId: form.branchId || null,
        party: form.party || (form.branchId ? branches.find(b => b._id === form.branchId)?.name : "")
      };

      await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });
    } else if (type === "transfer") {
      const transactionsToSubmit = [];
      const fromBranch = branches.find(b => b._id === form.fromBranchId);
      const toBranch = branches.find(b => b._id === form.toBranchId);

      if (!fromBranch || !toBranch) {
        alert("يرجى اختيار الفرع المحول منه والفرع المحول إليه");
        return;
      }

      for (const [productId, quantity] of Object.entries(quantities)) {
        if (quantity > 0) {
          // 1. مرتجع من الفرع الأول إلى المخزون
          transactionsToSubmit.push({
            productId,
            quantity,
            type: "incoming",
            party: "المخزون (تحويل)",
            branchId: form.fromBranchId,
            date: selectedDate,
          });

          // 2. تحميل على الفرع الثاني من المخزون
          transactionsToSubmit.push({
            productId,
            quantity,
            type: "outgoing",
            party: `تحويل من ${fromBranch.name}`,
            branchId: form.toBranchId,
            date: selectedDate,
          });
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
    } else if (type !== "delete") {
      // إعداد البيانات للإرسال الجماعي
      const transactionsToSubmit = [];
      const branchName = form.branchId
        ? branches.find(b => b._id === form.branchId)?.name
        : form.party;

      for (const [productId, quantity] of Object.entries(quantities)) {
        if (quantity > 0) {
          const product = products.find((p: any) => String(p._id) === String(productId));
          if (!product) continue;
          
          const transaction: any = {
            productId,
            quantity,
            type,
            party: branchName || form.party, // استخدام اسم الفرع كجهة أو الجهة المدخلة
            branchId: form.branchId,
            date: selectedDate,
          };

          if (type === "purchase" && product) {
            // المشتريات تأتي من مورد وليس من فرع
            transaction.party = form.party;
            transaction.branchId = null;
            transaction.amount = quantity * (product.purchasePrice || 0);
          } else if (type === "sale" && product) {
            transaction.amount = amounts[productId] !== undefined && amounts[productId] !== 0
              ? amounts[productId]
              : quantity * (product.sellingPrice || 0);
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
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-gray-600 rounded-lg mb-4">
        <table className="w-full text-sm text-right text-gray-300">
          <thead className="text-xs uppercase bg-gray-700 text-gray-300 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3">اسم الصنف</th>
              <th className="px-4 py-3">الوزن</th>
              <th className="px-4 py-3">سعر الشراء</th>
              <th className="px-4 py-3">سعر البيع</th>
              <th className="px-4 py-3 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(newProducts).map(([id, product], index) => (
              <tr key={id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={product.name || ""}
                    onChange={(e) => setNewProducts({ ...newProducts, [id]: { ...product, name: e.target.value } })}
                    className="bg-gray-600 border border-gray-500 text-white rounded w-full p-1.5"
                    placeholder="اسم الصنف"
                    required
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={product.weight || ""}
                    onChange={(e) => setNewProducts({ ...newProducts, [id]: { ...product, weight: e.target.value } })}
                    className="bg-gray-600 border border-gray-500 text-white rounded w-full p-1.5"
                    placeholder="الوزن (اختياري)"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    step="0.01"
                    value={product.purchasePrice || ""}
                    onChange={(e) => setNewProducts({ ...newProducts, [id]: { ...product, purchasePrice: parseFloat(e.target.value) } })}
                    className="bg-gray-600 border border-gray-500 text-white rounded w-full p-1.5"
                    placeholder="0.00"
                    required
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    step="0.01"
                    value={product.sellingPrice || ""}
                    onChange={(e) => setNewProducts({ ...newProducts, [id]: { ...product, sellingPrice: parseFloat(e.target.value) } })}
                    className="bg-gray-600 border border-gray-500 text-white rounded w-full p-1.5"
                    placeholder="0.00"
                    required
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const updatedProducts = { ...newProducts };
                      delete updatedProducts[id];
                      setNewProducts(updatedProducts);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <button
        type="button"
        onClick={() => setNewProducts({ ...newProducts, [Date.now()]: {} })}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition w-full mb-4 font-bold"
      >
        + إضافة صنف جديد
      </button>
    </>
  );

  // حقول العمليات
  const transactionFields = (
    <>
      {/* اختيار الفرع أو الجهة - مشترك لجميع العمليات */}
      {type === "transfer" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">الفرع المحول منه (المرتجع)</label>
            <select
              name="fromBranchId"
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
              required
            >
              <option value="">اختر الفرع</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">الفرع المحول إليه (التحميل)</label>
            <select
              name="toBranchId"
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
              required
            >
              <option value="">اختر الفرع</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (type === "outgoing" || type === "incoming" || type === "damaged" || type === "purchase" || type === "sale" || type === "dailyExpense") ? (
        <div className="mb-4">
          {(type === "outgoing" || type === "incoming" || type === "damaged" || type === "dailyExpense") && (
            <>
              <label className="block mb-2 text-sm font-medium text-gray-300">الفرع</label>
              <select
                name="branchId"
                onChange={handleChange}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5 mb-2"
                required={type !== "dailyExpense"}
              >
                <option value="">اختر الفرع</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {(type === "purchase" || type === "sale" || type === "dailyExpense") && (
            <>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                {type === "purchase" ? "المورد" : type === "sale" ? "العميل" : "الجهة / المورد"}
              </label>
              <select
                name="party"
                onChange={handleChange}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                value={form.party || ""}
                required={type === "purchase"}
              >
                <option value="">{type === "purchase" ? "اختر المورد" : "اختر الجهة"}</option>
                {contacts
                  .filter(c => type === "purchase" ? c.type === "supplier" : true)
                  .map((contact) => (
                    <option key={contact._id} value={contact.name}>
                      {contact.name} ({contact.type === 'customer' ? 'عميل' : contact.type === 'supplier' ? 'مورد' : 'أخرى'})
                    </option>
                  ))}
                <option value="ADD_NEW">+ إضافة جهة جديدة</option>
              </select>

              {form.party === "ADD_NEW" && (
                <div className="mt-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <input
                    id="newContactName"
                    placeholder="اسم الجهة الجديدة"
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2"
                    onKeyDown={async (e: any) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const name = e.target.value;
                        if (name) {
                          const res = await fetch("/api/contacts", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name, type: type === 'purchase' ? 'supplier' : 'other' })
                          });
                          if (res.ok) {
                            const newContact = await res.json();
                            setContacts([...contacts, newContact]);
                            setForm({ ...form, party: newContact.name });
                          }
                        }
                      }
                    }}
                  />
                  <p className="text-xs text-gray-400 mt-1">اضغط Enter للحفظ</p>
                </div>
              )}
            </>
          )}
        </div>
      ) : null}

      {type === "dailyExpense" ? (
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">نوع المصروف</label>
            <div className="flex gap-2">
              <select
                name="expenseCategoryId"
                onChange={handleChange}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg flex-1 p-2.5"
                required
              >
                <option value="">اختر نوع المصروف</option>
                {expenseCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} ({cat.classification})
                  </option>
                ))}
                <option value="other">أخرى (إدخال يدوي)</option>
              </select>
              <button
                type="button"
                onClick={() => window.open('/expense-categories', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition"
                title="إدارة الأنواع"
              >
                +
              </button>
            </div>
            {form.expenseCategoryId === "other" && (
              <input
                name="expenseSubtype"
                onChange={handleChange}
                className="mt-2 bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                placeholder="اكتب نوع المصروف هنا"
                required
              />
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">المبلغ</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">الوصف</label>
            <textarea
              name="description"
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
              placeholder="وصف إضافي للمصروف..."
              rows={3}
            />
          </div>
        </div>
      ) : (
        <BulkTransactionTable
          products={products}
          dailyReport={dailyReport}
          type={type}
          quantities={quantities}
          amounts={amounts}
          onQuantityChange={handleQuantityChange}
          onAmountChange={handleAmountChange}
        />
      )}
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
  } else if (type === "operationSelector") {
    const operations = [
      { type: 'outgoing', label: 'تحميل', icon: <FaArrowUp />, color: 'red' },
      { type: 'incoming', label: 'مرتجع', icon: <FaArrowDown />, color: 'yellow' },
      { type: 'purchase', label: 'شراء', icon: <FaCartPlus />, color: 'green' },
      { type: 'transfer', label: 'تحويل', icon: <FaRightLeft />, color: 'blue' },
      { type: 'dailyExpense', label: 'مصروف', icon: <FaWallet />, color: 'orange' },
      { type: 'damaged', label: 'تالف', icon: <FaBan />, color: 'purple' },
      { type: 'addProduct', label: 'إضافة صنف جديد', icon: <FaCartPlus />, color: 'teal' },
    ];

    body = (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
        {operations.map((op) => (
          <button
            key={op.type}
            onClick={() => onSelectType(op.type)}
            className={`flex flex-col gap-3 rounded-2xl border border-${op.color}-500/20 bg-${op.color}-500/10 p-6 items-center justify-center transition-all hover:border-${op.color}-500/40 hover:bg-${op.color}-500/20 active:scale-95 group shadow-sm`}
          >
            <div className={`text-${op.color}-500 bg-${op.color}-500/20 p-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
              {op.icon}
            </div>
            <h2 className="text-white text-sm font-black tracking-wide">{op.label}</h2>
          </button>
        ))}
      </div>
    );
  } else {
    body = transactionFields;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`bg-gray-800 rounded-lg shadow-xl w-[95%] ${type === 'delete' || type === 'addProduct' ? 'max-w-[500px]' : 'max-w-4xl'} p-4 mx-2 modal-content scale-95`}>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h3 className="text-xl font-semibold">{typeLabels[type] || "تسجيل عملية"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"> <FaXmark className="text-xl" /></button>
        </div>
        {type !== "delete" && type !== "operationSelector" ? (
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
