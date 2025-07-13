"use client";

import React from "react";
import PasswordPrompt from "@/components/PasswordPrompt";
import { FaMoneyBillWave, FaShoppingCart, FaReceipt } from "react-icons/fa";
import useTransactions from "./hooks/useTransactions";
import TransactionSummary from "./components/TransactionSummary";
import TransactionButtons from "./components/TransactionButtons";
import TransactionList from "./components/TransactionList";
import { FinancialTransaction } from "./types";
import { expenseCategories, incomeCategories, purchaseCategories } from "./utils/constants";

export default function FinancialTransactionsPage() {
  const {
    isAuthorized,
    setIsAuthorized,
    transactions,
    products,
    selectedDate,
    setSelectedDate,
    showModal,
    setShowModal,
    modalType,
    formData,
    setFormData,
    filterType,
    setFilterType,
    handleInputChange,
    handleSubmit,
    handleDelete,
    openModal,
    calculateTotals,
  } = useTransactions();

  const { totalExpenses, totalIncome, totalPurchases } = calculateTotals();

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-white mb-8">
            المعاملات المالية
          </h1>
          <PasswordPrompt
            onSuccess={() => setIsAuthorized(true)}
            label="أدخل كلمة المرور للوصول إلى المعاملات المالية"
            buttonText="تأكيد"
          />
        </div>
      </div>
    );
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

        <TransactionSummary 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          totals={{ totalExpenses, totalIncome, totalPurchases }}
        />

        <TransactionButtons 
          openModal={openModal}
          filterType={filterType}
          setFilterType={setFilterType}
          transactions={transactions}
        />

        <TransactionList 
          transactions={transactions}
          handleDelete={handleDelete}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          filterType={filterType}
          setFilterType={setFilterType}
        />
      </div>

      {/* نافذة إضافة معاملة جديدة */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 modal-content">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
              {/* العنوان */}
              <h3 className="text-xl font-semibold text-white">
                {modalType === "expense" && "إضافة مصروف جديد"}
                {modalType === "income" && "إضافة إيراد جديد"}
                {modalType === "purchase" && "تسجيل عملية شراء"}
              </h3>
              {/* زرالاغلاق */}
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* حقول الحسابات المالية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      الحساب المدين
                    </label>
                    <select
                      name="debitAccount"
                      value={formData.debitAccount || ''}
                      onChange={handleInputChange}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                      required
                    >
                      <option value="">اختر الحساب المدين</option>
                      <option value="المخزون">المخزون</option>
                      <option value="النقدية">النقدية</option>
                      <option value="الموردين">الموردين</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      الحساب الدائن
                    </label>
                    <select
                      name="creditAccount"
                      value={formData.creditAccount || ''}
                      onChange={handleInputChange}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                      required
                    >
                      <option value="">اختر الحساب الدائن</option>
                      <option value="النقدية">النقدية</option>
                      <option value="المصروفات">المصروفات</option>
                      <option value="المبيعات">المبيعات</option>
                    </select>
                  </div>
                </div>

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
                    التصنيف
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
                    required
                  >
                    <option value="">اختر التصنيف</option>
                    {modalType === "expense" &&
                      expenseCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    {modalType === "income" &&
                      incomeCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    {modalType === "purchase" &&
                      purchaseCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
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
                          <option key={product._id} value={product._id}>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.debitAccount || !formData.creditAccount}
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
