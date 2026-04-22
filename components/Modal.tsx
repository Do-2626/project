import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaArrowUp, FaArrowDown, FaCartPlus, FaWallet, FaBan, FaRightLeft, FaXmark
} from "react-icons/fa6";
import PasswordPrompt from "./PasswordPrompt";
import BulkTransactionTable from "@/app/inventory/components/BulkTransactionTable";



// ==================== الأنواع ====================
interface FormState {
  [key: string]: any;
  name?: string;
  weight?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  amount?: number;
  description?: string;
  branchId?: string;
  fromBranchId?: string;
  toBranchId?: string;
  party?: string;
  expenseCategoryId?: string;
  expenseSubtype?: string;
}


// ==================== الثوابت ====================
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

const OPERATIONS = [
  { type: 'outgoing', label: 'تحميل', icon: <FaArrowUp />, color: 'red' },
  { type: 'incoming', label: 'مرتجع', icon: <FaArrowDown />, color: 'yellow' },
  { type: 'purchase', label: 'شراء', icon: <FaCartPlus />, color: 'green' },
  { type: 'transfer', label: 'تحويل', icon: <FaRightLeft />, color: 'blue' },
  { type: 'dailyExpense', label: 'مصروف', icon: <FaWallet />, color: 'orange' },
  { type: 'damaged', label: 'تالف', icon: <FaBan />, color: 'purple' },
];

const REQUIRES_PARTY = new Set(['purchase', 'sale', 'dailyExpense']);
const REQUIRES_BRANCH = new Set(['outgoing', 'incoming', 'damaged', 'dailyExpense']);

// ==================== المكون الرئيسي ====================
export default function Modal({ open, type, onClose, onSuccess, products, selectedDate, transactionId, onDeleteConfirm, dailyReport, onSelectType }: any) {
  // ==================== State ====================
  const [form, setForm] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [contacts, setContacts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== Helper Functions ====================
  const resetState = useCallback(() => {
    setQuantities({});
    setAmounts({});
    setForm({});
    setIsSubmitting(false);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [branchesRes, categoriesRes, contactsRes] = await Promise.all([
        fetch("/api/branches").then(res => res.json()),
        fetch("/api/expense-categories").then(res => res.json()),
        fetch("/api/contacts").then(res => res.json())
      ]);
      setBranches(branchesRes);
      setExpenseCategories(categoriesRes);
      setContacts(contactsRes);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  }, []);

  // ==================== Effects ====================
  useEffect(() => {
    if (open) {
      resetState();
      fetchData();
    }
  }, [open, resetState, fetchData]);

  // ==================== Handlers ====================
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleQuantityChange = useCallback((productId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
    
    if (type === "sale") {
      const product = products.find((p: any) => p._id === productId);
      if (product?.sellingPrice) {
        setAmounts(prev => ({ ...prev, [productId]: quantity * product.sellingPrice }));
      }
    }
  }, [type, products]);

  const handleAmountChange = useCallback((productId: string, amount: number) => {
    setAmounts(prev => ({ ...prev, [productId]: amount }));
  }, []);

  const handleAddNewContact = async (name: string) => {
    if (!name) return;
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type: type === 'purchase' ? 'supplier' : 'other' })
    });
    if (res.ok) {
      const newContact = await res.json();
      setContacts(prev => [...prev, newContact]);
      setForm((prev: any) => ({ ...prev, party: newContact.name }));
    }
  };

  const buildTransaction = useCallback((productId: string, quantity: number) => {
    const product = products.find((p: any) => p._id === productId);
    const branchName = branches.find(b => b._id === form.branchId)?.name;
    
    const transaction: any = {
      productId,
      quantity,
      type,
      party: branchName || form.party,
      branchId: form.branchId,
      date: selectedDate,
    };

    if (type === "purchase" && product) {
      transaction.party = form.party;
      transaction.branchId = null;
      transaction.amount = quantity * (product.purchasePrice || 0);
    } else if (type === "sale" && product) {
      transaction.amount = amounts[productId] || (quantity * (product.sellingPrice || 0));
    }

    return transaction;
  }, [products, branches, form, type, selectedDate, amounts]);

  const handleAddProduct = async () => {
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
  };

  const handleDailyExpense = async () => {
    const selectedCategory = expenseCategories.find(c => c._id === form.expenseCategoryId);
    await fetch("/api/finance/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "expense",
        amount: Number(form.amount),
        category: selectedCategory?.name || "أخرى",
        expenseCategoryId: form.expenseCategoryId || null,
        expenseSubtype: form.expenseSubtype || "",
        description: form.description || "",
        date: selectedDate,
        branchId: form.branchId || null,
        party: form.party || branches.find(b => b._id === form.branchId)?.name || ""
      }),
    });
  };

  const handleTransfer = async () => {
    const fromBranch = branches.find(b => b._id === form.fromBranchId);
    const toBranch = branches.find(b => b._id === form.toBranchId);

    if (!fromBranch || !toBranch) {
      alert("يرجى اختيار الفرع المحول منه والفرع المحول إليه");
      return false;
    }

    const transactionsToSubmit = [];
    for (const [productId, quantity] of Object.entries(quantities)) {
      if (quantity > 0) {
        transactionsToSubmit.push(
          { productId, quantity, type: "incoming", party: "المخزون (تحويل)", branchId: form.fromBranchId, date: selectedDate },
          { productId, quantity, type: "outgoing", party: `تحويل من ${fromBranch.name}`, branchId: form.toBranchId, date: selectedDate }
        );
      }
    }

    if (transactionsToSubmit.length === 0) {
      alert("يرجى إدخال كمية لمنتج واحد على الأقل");
      return false;
    }

    await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(transactionsToSubmit) });
    return true;
  };

  const handleStandardTransaction = async () => {
    const transactionsToSubmit = [];
    for (const [productId, quantity] of Object.entries(quantities)) {
      if (quantity > 0) {
        transactionsToSubmit.push(buildTransaction(productId, Number(quantity)));
      }
    }

    if (transactionsToSubmit.length === 0) {
      alert("يرجى إدخال كمية لمنتج واحد على الأقل");
      return false;
    }

    await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(transactionsToSubmit) });
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (type === "addProduct") await handleAddProduct();
      else if (type === "dailyExpense") await handleDailyExpense();
      else if (type === "transfer") await handleTransfer();
      else if (type !== "delete") await handleStandardTransaction();
      
      onSuccess();
    } catch (error) {
      console.error("Submission error:", error);
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSuccess = useCallback(() => setShowPassword(true), []);

  // ==================== Render Helpers ====================
  const getModalMaxWidth = () => {
    if (type === 'delete' || type === 'addProduct') return 'max-w-[500px]';
    if (type === 'operationSelector') return 'max-w-2xl';
    return 'max-w-4xl';
  };

  const renderBranchSelect = (name: string, label: string, required = true) => (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
      <select name={name} onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" required={required}>
        <option value="">اختر الفرع</option>
        {branches.map(branch => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
      </select>
    </div>
  );

  const renderPartySelect = () => (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-300">
        {type === "purchase" ? "المورد" : type === "sale" ? "العميل" : "الجهة / المورد"}
      </label>
      <select name="party" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" value={form.party || ""} required={type === "purchase"}>
        <option value="">{type === "purchase" ? "اختر المورد" : "اختر الجهة"}</option>
        {contacts.filter(c => type === "purchase" ? c.type === "supplier" : true).map(contact => (
          <option key={contact._id} value={contact.name}>{contact.name} ({contact.type === 'customer' ? 'عميل' : contact.type === 'supplier' ? 'مورد' : 'أخرى'})</option>
        ))}
        <option value="ADD_NEW">+ إضافة جهة جديدة</option>
      </select>

      {form.party === "ADD_NEW" && (
        <div className="mt-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
          <input placeholder="اسم الجهة الجديدة" className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2" onKeyDown={(e: any) => e.key === 'Enter' && handleAddNewContact(e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">اضغط Enter للحفظ</p>
        </div>
      )}
    </div>
  );

  const renderExpenseFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-300">نوع المصروف</label>
        <div className="flex gap-2">
          <select name="expenseCategoryId" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg flex-1 p-2.5" required>
            <option value="">اختر نوع المصروف</option>
            {expenseCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name} ({cat.classification})</option>)}
            <option value="other">أخرى (إدخال يدوي)</option>
          </select>
          <button type="button" onClick={() => window.open('/expense-categories', '_blank')} className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition" title="إدارة الأنواع">+</button>
        </div>
        {form.expenseCategoryId === "other" && (
          <input name="expenseSubtype" onChange={handleChange} className="mt-2 bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" placeholder="اكتب نوع المصروف هنا" required />
        )}
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-300">المبلغ</label>
        <input name="amount" type="number" step="0.01" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" placeholder="0.00" required />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-300">الوصف</label>
        <textarea name="description" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" placeholder="وصف إضافي للمصروف..." rows={3} />
      </div>
    </div>
  );

  const renderTransferFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {renderBranchSelect("fromBranchId", "الفرع المحول منه (المرتجع)")}
      {renderBranchSelect("toBranchId", "الفرع المحول إليه (التحميل)")}
    </div>
  );

  const renderBranchPartyFields = () => {
    if (type === "transfer") return renderTransferFields();
    
    if (REQUIRES_BRANCH.has(type) && type !== "dailyExpense") {
      return <div className="mb-4">{renderBranchSelect("branchId", "الفرع")}</div>;
    }
    
    if (REQUIRES_PARTY.has(type)) {
      return renderPartySelect();
    }
    
    return null;
  };

  // ==================== Modal Body ====================
  const modalBody = useMemo(() => {
    if (type === "addProduct") {
      if (!showPassword) {
        return <PasswordPrompt onSuccess={handlePasswordSuccess} label="كلمة المرور لإضافة صنف جديد" buttonText="تأكيد" />;
      }
      return (
        <>
          <div><label className="block mb-2 text-sm font-medium text-gray-300">اسم الصنف</label><input name="name" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" required /></div>
          <div><label className="block mb-2 text-sm font-medium text-gray-300">الوزن (اختياري)</label><input name="weight" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" /></div>
          <div><label className="block mb-2 text-sm font-medium text-gray-300">سعر الشراء</label><input name="purchasePrice" type="number" step="0.01" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" required /></div>
          <div><label className="block mb-2 text-sm font-medium text-gray-300">سعر البيع</label><input name="sellingPrice" type="number" step="0.01" onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5" required /></div>
        </>
      );
    }

    if (type === "delete") {
      return (
        <div className="text-white text-center">
          <p className="mb-4">هل أنت متأكد أنك تريد حذف هذه العملية؟</p>
          <div className="flex justify-center gap-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition">إلغاء</button>
            <button type="button" onClick={() => onDeleteConfirm(transactionId)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition">تأكيد الحذف</button>
          </div>
        </div>
      );
    }

    if (type === "operationSelector") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
          {OPERATIONS.map(op => (
            <button key={op.type} onClick={() => onSelectType(op.type)} className={`flex flex-col gap-3 rounded-2xl border border-${op.color}-500/20 bg-${op.color}-500/10 p-6 items-center justify-center transition-all hover:border-${op.color}-500/40 hover:bg-${op.color}-500/20 active:scale-95 group shadow-sm`}>
              <div className={`text-${op.color}-500 bg-${op.color}-500/20 p-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>{op.icon}</div>
              <h2 className="text-white text-sm font-black tracking-wide">{op.label}</h2>
            </button>
          ))}
        </div>
      );
    }

    // Transaction fields
    return (
      <>
        {renderBranchPartyFields()}
        {type === "dailyExpense" ? renderExpenseFields() : (
          <BulkTransactionTable products={products} dailyReport={dailyReport} type={type} quantities={quantities} amounts={amounts} onQuantityChange={handleQuantityChange} onAmountChange={handleAmountChange} />
        )}
      </>
    );
  }, [type, showPassword, branches, contacts, form, quantities, amounts, products, dailyReport, expenseCategories]);

  // ==================== Render ====================
  if (!open) return null;

  const isFormType = type !== "delete" && type !== "operationSelector";
  const showSubmitButton = isFormType && !(type === "addProduct" && !showPassword);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`bg-gray-800 rounded-lg shadow-xl w-[95%] ${getModalMaxWidth()} p-4 mx-2 modal-content scale-95`}>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h3 className="text-xl font-semibold">{typeLabels[type] || "تسجيل عملية"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><FaXmark className="text-xl" /></button>
        </div>

        {isFormType ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">{modalBody}</div>
            <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-700">
              <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition">إلغاء</button>
              <button type="submit" disabled={!showSubmitButton || isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </form>
        ) : (
          modalBody
        )}
      </div>
    </div>
  );
}