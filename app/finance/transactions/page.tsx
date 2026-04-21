"use client";

import React, { useEffect, useState } from "react";
import { FaMoneyBillWave, FaShoppingCart, FaReceipt, FaPlus, FaSearch } from "react-icons/fa";
import Calendar from "@/components/Calendar";
import dayjs from "dayjs";
import ExportButton from "@/components/ExportButton";
import ExportButtonCSV from "@/components/ExportButtonCSV";
import Link from "next/link";

// تعريف أنواع البيانات
interface Product {
  _id: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  weight?: string;
}

interface Branch {
  _id: string;
  name: string;
}

interface ExpenseCategory {
  _id: string;
  name: string;
  classification: string;
}

interface FinancialTransaction {
  _id: string;
  type: "expense" | "income" | "purchase";
  amount: number;
  category: string;
  description?: string;
  party?: string;
  date: string;
  invoiceNumber?: string;
  productId?: string;
  quantity?: number;
  branchId?: string;
  expenseCategoryId?: string;
  expenseSubtype?: string;
  isRecurring: boolean;
  createdAt: string;
}

const staticExpenseCategories = [
  "إيجار",
  "رواتب",
  "مرافق",
  "نقل",
  "تسويق",
  "صيانة",
  "مستلزمات",
  "أخرى",
];

const incomeCategories = ["مبيعات", "استثمارات", "إيرادات أخرى"];

const purchaseCategories = [
  "مشتريات على الحساب",
  "مشتريات نقدية",
  "مشتريات أخرى / سرافيس فارغة",
];

export default function FinancialTransactionsPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [dbExpenseCategories, setDbExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"expense" | "income" | "purchase">(
    "expense"
  );
  const [formData, setFormData] = useState<Partial<FinancialTransaction>>({
    date: selectedDate,
    type: "expense",
    amount: 0,
    category: "",
    description: "",
    party: "",
    invoiceNumber: "",
    isRecurring: false,
    branchId: "",
    expenseCategoryId: "",
    expenseSubtype: "",
  });
  const [filterType, setFilterType] = useState<string>("all");
  const [eqtera7_elwasf, setEqtera7_elwasf] = useState({
    mim: "",
    aadd: "",
    name: "",
  });

  // جلب المعاملات المالية
  useEffect(() => {
    fetchTransactions();
  }, [selectedDate, filterType]);

  // جلب المنتجات والفروع والتصنيفات
  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then(setProducts);

    fetch("/api/branches")
      .then((res) => res.json())
      .then(setBranches);

    fetch("/api/expense-categories")
      .then((res) => res.json())
      .then(setDbExpenseCategories);
  }, []);

  // تحديث تاريخ النموذج عند تغيير التاريخ المحدد
  useEffect(() => {
    setFormData((prev) => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const fetchTransactions = async () => {
    let url = `/api/finance/transactions?date=${selectedDate}`;
    if (filterType !== "all") {
      url += `&type=${filterType}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    setTransactions(data);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name == "productId") {
      if (e.target instanceof HTMLSelectElement) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedText = selectedOption ? selectedOption.text : "";
        setEqtera7_elwasf({ ...eqtera7_elwasf, name: selectedText });
      }
    } else if (name == "quantity") {
      setEqtera7_elwasf({ ...eqtera7_elwasf, aadd: value });
    } else if (name == "party") {
      setEqtera7_elwasf({ ...eqtera7_elwasf, mim: value });
    }

    if (e.target instanceof HTMLSelectElement || name == "productId") {
      if (e.target instanceof HTMLSelectElement) {
        setEqtera7_elwasf({
          ...eqtera7_elwasf,
          name: e.target.options[e.target.selectedIndex].text,
        });
      }
    }

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: modalType,
          date: selectedDate,
        }),
      });

      if (response.ok) {
        // إعادة تعيين النموذج وإغلاق النافذة المنبثقة
        setFormData({
          date: selectedDate,
          type: modalType,
          amount: 0,
          category: "",
          description: "",
          party: "",
          invoiceNumber: "",
          isRecurring: false,
          branchId: "",
          expenseCategoryId: "",
          expenseSubtype: "",
        });
        setSearchTerm("");
        setShowModal(false);
        fetchTransactions();
      } else {
        const error = await response.json();
        alert(`خطأ: ${error.message}`);
      }
    } catch (error) {
      console.error("خطأ في إرسال النموذج:", error);
      alert("حدث خطأ أثناء معالجة الطلب");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المعاملة؟")) return;

    try {
      const response = await fetch(`/api/finance/transactions?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTransactions();
      } else {
        const error = await response.json();
        alert(`خطأ: ${error.message}`);
      }
    } catch (error) {
      console.error("خطأ في حذف المعاملة:", error);
      alert("حدث خطأ أثناء معالجة الطلب");
    }
  };

  const openModal = (type: "expense" | "income" | "purchase") => {
    setModalType(type);
    setFormData({
      date: selectedDate,
      type,
      amount: 0,
      category: "",
      description: "",
      party: "",
      invoiceNumber: "",
      isRecurring: false,
      branchId: "",
      expenseCategoryId: "",
      expenseSubtype: "",
      ...(type === "purchase"
        ? {
            productId: "",
            quantity: 1,
          }
        : {}),
    });
    setSearchTerm("");
    setShowModal(true);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "expense":
        return "مصروف";
      case "income":
        return "إيراد";
      case "purchase":
        return "مشتريات";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "expense":
        return "text-red-500";
      case "income":
        return "text-green-500";
      case "purchase":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "expense":
        return <FaMoneyBillWave className="text-red-500" />;
      case "income":
        return <FaReceipt className="text-green-500" />;
      case "purchase":
        return <FaShoppingCart className="text-blue-500" />;
      default:
        return null;
    }
  };

  // حساب إجماليات المعاملات
  const calculateTotals = () => {
    let totalExpenses = 0;
    let totalIncome = 0;
    let totalPurchases = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        totalExpenses += transaction.amount;
      } else if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else if (transaction.type === "purchase") {
        totalPurchases += transaction.amount;
      }
    });

    return { totalExpenses, totalIncome, totalPurchases };
  };

  const { totalExpenses, totalIncome, totalPurchases } = calculateTotals();

  function copyToDescription(text: string): void {
    setFormData({ ...formData, description: text });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 drop-shadow-lg tracking-wide font-cairo">
            المعاملات المالية
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium font-cairo">
            إدارة المصروفات والإيرادات والمشتريات
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">التاريخ</h2>
            <Calendar selectedDate={selectedDate} onChange={setSelectedDate} />
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-white">
              ملخص اليوم
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">المصروفات</p>
                <p className="text-2xl font-bold text-red-500">
                  {totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">الإيرادات</p>
                <p className="text-2xl font-bold text-green-500">
                  {totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">المشتريات</p>
                <p className="text-2xl font-bold text-blue-500">
                  {totalPurchases.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => openModal("expense")}
            className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
          >
            <FaMoneyBillWave size={20} />
            <span className="text-lg font-semibold">إضافة مصروف</span>
          </button>
          <button
            onClick={() => openModal("income")}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
          >
            <FaReceipt size={20} />
            <span className="text-lg font-semibold">إضافة إيراد</span>
          </button>
          <button
            onClick={() => openModal("purchase")}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
          >
            <FaShoppingCart size={20} />
            <span className="text-lg font-semibold">تسجيل مشتريات</span>
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="p-4 bg-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">المعاملات</h2>
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
              >
                <option value="all">جميع المعاملات</option>
                <option value="expense">المصروفات</option>
                <option value="income">الإيرادات</option>
                <option value="purchase">المشتريات</option>
              </select>
              <ExportButtonCSV
                data={transactions}
                fileName={`financial-transactions-${selectedDate}`}
                label="تصدير"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-6 py-3">النوع</th>
                  <th className="px-6 py-3">الفرع</th>
                  <th className="px-6 py-3">التصنيف</th>
                  <th className="px-6 py-3">المبلغ</th>
                  <th className="px-6 py-3">الوصف</th>
                  <th className="px-6 py-3">الجهة</th>
                  <th className="px-6 py-3">رقم الفاتورة</th>
                  <th className="px-6 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr className="bg-gray-800 border-b border-gray-700">
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      لا توجد معاملات لهذا اليوم
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className={getTypeColor(transaction.type)}>
                          {getTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {branches.find(b => b._id === transaction.branchId?.toString())?.name || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {transaction.expenseSubtype || transaction.category}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {transaction.description || "-"}
                      </td>
                      <td className="px-6 py-4">{transaction.party || "-"}</td>
                      <td className="px-6 py-4">
                        {transaction.invoiceNumber || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* نافذة إضافة معاملة جديدة */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 modal-content max-h-[560px] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
              <h3 className="text-xl font-semibold text-white">
                {modalType === "expense" && "إضافة مصروف جديد"}
                {modalType === "income" && "إضافة إيراد جديد"}
                {modalType === "purchase" && "تسجيل عملية شراء"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white w-7"
              >
                <span className="text-3xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* حقول مشتركة */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    المبلغ
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    الفرع
                  </label>
                  <select
                    name="branchId"
                    value={formData.branchId?.toString()}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
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
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    التصنيف
                  </label>
                  <div className="relative">
                    <div className="flex gap-2">
                       <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="ابحث عن تصنيف..."
                          value={searchTerm || formData.category || ""}
                          onFocus={() => setShowCategoryDropdown(true)}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setFormData({...formData, category: e.target.value});
                            setShowCategoryDropdown(true);
                          }}
                          className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5 pr-10"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                       </div>
                       {modalType === "expense" && (
                         <Link 
                          href="/expense-categories" 
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg flex items-center justify-center"
                          title="إدارة الأنواع"
                         >
                          <FaPlus />
                         </Link>
                       )}
                    </div>

                    {showCategoryDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {modalType === "expense" ? (
                          <>
                            {dbExpenseCategories
                              .filter(c => c.name.includes(searchTerm))
                              .map((category) => (
                                <div
                                  key={category._id}
                                  className="p-2.5 hover:bg-gray-600 cursor-pointer text-white"
                                  onClick={() => {
                                    setFormData({ ...formData, category: category.name, expenseCategoryId: category._id });
                                    setSearchTerm(category.name);
                                    setShowCategoryDropdown(false);
                                  }}
                                >
                                  {category.name} <span className="text-xs text-gray-400">({category.classification})</span>
                                </div>
                              ))}
                            <div
                              className="p-2.5 hover:bg-gray-600 cursor-pointer text-blue-400 font-bold"
                              onClick={() => {
                                setFormData({ ...formData, category: "أخرى", expenseCategoryId: undefined });
                                setSearchTerm("أخرى");
                                setShowCategoryDropdown(false);
                              }}
                            >
                              أخرى (إدخال يدوي)
                            </div>
                          </>
                        ) : (
                          <>
                            {(modalType === "income" ? incomeCategories : purchaseCategories)
                              .filter(c => c.includes(searchTerm))
                              .map((category) => (
                                <div
                                  key={category}
                                  className="p-2.5 hover:bg-gray-600 cursor-pointer text-white"
                                  onClick={() => {
                                    setFormData({ ...formData, category });
                                    setSearchTerm(category);
                                    setShowCategoryDropdown(false);
                                  }}
                                >
                                  {category}
                                </div>
                              ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {formData.category === "أخرى" && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      نوع المصروف (يدوي)
                    </label>
                    <input
                      type="text"
                      name="expenseSubtype"
                      value={formData.expenseSubtype}
                      onChange={handleInputChange}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                      placeholder="اكتب نوع المصروف هنا..."
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    الجهة
                  </label>
                  <input
                    type="text"
                    name="party"
                    value={formData.party}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                    placeholder={
                      modalType === "purchase"
                        ? "المورد"
                        : modalType === "expense"
                        ? "المستفيد"
                        : "المصدر"
                    }
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    رقم الفاتورة
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                  />
                </div>

                {/* حقول خاصة بالمشتريات */}
                {modalType === "purchase" && (
                  <>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        المنتج
                      </label>
                      <select
                        name="productId"
                        value={formData.productId?.toString()}
                        onChange={handleInputChange}
                        className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                        required
                      >
                        <option value="">اختر المنتج</option>
                        {products.map((product) => (
                          <option
                            id={`${product._id}`}
                            key={product._id}
                            value={product._id}
                          >
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        الكمية
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                        required
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        الوصف
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {`${eqtera7_elwasf.aadd} -${eqtera7_elwasf.name} - ${eqtera7_elwasf.mim}`}

                      {/* ايقونة لنسخ نص */}
                      <button
                        onClick={() =>
                          copyToDescription(
                            `${eqtera7_elwasf.aadd} -${eqtera7_elwasf.name} - ${eqtera7_elwasf.mim}`
                          )
                        }
                        className="text-gray-400 hover:text-white"
                      >
                        <span>
                          <svg
                            height={30}
                            width={30}
                            viewBox="0 0 25 25"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              {" "}
                              <path
                                d="M8.9707 19.42V13.89"
                                stroke="#d1d5db"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>{" "}
                              <path
                                d="M2.28234 12.67C2.25751 12.2167 2.32536 11.7631 2.48175 11.3369C2.63813 10.9106 2.87975 10.5208 3.19187 10.1911C3.504 9.86141 3.88006 9.59877 4.29708 9.41931C4.71411 9.23985 5.16335 9.14734 5.61735 9.14734C6.07135 9.14734 6.52058 9.23985 6.9376 9.41931C7.35463 9.59877 7.73069 9.86141 8.04281 10.1911C8.35493 10.5208 8.59657 10.9106 8.75296 11.3369C8.90934 11.7631 8.97717 12.2167 8.95234 12.67V18.3C8.97717 18.7533 8.90934 19.207 8.75296 19.6332C8.59657 20.0594 8.35493 20.4492 8.04281 20.7789C7.73069 21.1086 7.35463 21.3712 6.9376 21.5507C6.52058 21.7301 6.07135 21.8227 5.61735 21.8227C5.16335 21.8227 4.71411 21.7301 4.29708 21.5507C3.88006 21.3712 3.504 21.1086 3.19187 20.7789C2.87975 20.4492 2.63813 20.0594 2.48175 19.6332C2.32536 19.207 2.25751 18.7533 2.28234 18.3V12.67Z"
                                stroke="#d1d5db"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>{" "}
                              <path
                                d="M8.97076 18.3C8.96813 18.7399 9.05217 19.176 9.21809 19.5835C9.38402 19.9909 9.62857 20.3617 9.93779 20.6747C10.247 20.9876 10.6148 21.2366 11.0203 21.4073C11.4257 21.5781 11.8608 21.6674 12.3008 21.67H16.4208C17.3814 21.6693 18.316 21.357 19.0841 20.78C19.8522 20.203 20.4125 19.3924 20.6808 18.47L22.1808 13.39C22.3002 13.0523 22.3372 12.691 22.2889 12.3361C22.2405 11.9812 22.1081 11.643 21.9028 11.3496C21.6974 11.0562 21.4249 10.816 21.108 10.6491C20.7911 10.4822 20.4389 10.3934 20.0808 10.39H14.5608V5.10999C14.5621 4.91825 14.5256 4.72818 14.4535 4.55054C14.3813 4.3729 14.2749 4.21121 14.1402 4.07471C14.0056 3.9382 13.8454 3.82953 13.6687 3.75494C13.4921 3.68036 13.3025 3.64132 13.1108 3.64001V3.64001C12.7953 3.64144 12.4889 3.74572 12.2381 3.93701C11.9872 4.1283 11.8056 4.39617 11.7208 4.70001L8.97076 13.86"
                                stroke="#d1d5db"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>{" "}
                            </g>
                          </svg>
                        </span>
                      </button>
                    </div>
                  </>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600"
                  />
                  <label className="mr-2 text-sm font-medium text-gray-300">
                    معاملة متكررة
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
