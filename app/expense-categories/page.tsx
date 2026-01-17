"use client";

import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPlus, FaTag } from "react-icons/fa";
import PasswordPrompt from "@/components/PasswordPrompt";

interface ExpenseCategory {
  _id: string;
  name: string;
  classification: string;
  isActive: boolean;
}

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState({ name: "", classification: "تشغيلي" });

  useEffect(() => {
    if (isAuthorized) {
      fetchCategories();
    }
  }, [isAuthorized]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expense-categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch expense categories", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `/api/expense-categories/${editingCategory._id}`
        : "/api/expense-categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", classification: "تشغيلي" });
        setEditingCategory(null);
        fetchCategories();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category", error);
    }
  };

  const openModal = (category?: ExpenseCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, classification: category.classification });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", classification: "تشغيلي" });
    }
    setShowModal(true);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg mt-20">
          <h1 className="text-3xl font-bold text-center text-white mb-8">
            إدارة أنواع المصاريف
          </h1>
          <PasswordPrompt
            onSuccess={() => setIsAuthorized(true)}
            label="أدخل كلمة المرور للدخول"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-6 font-cairo">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">إدارة أنواع المصاريف</h1>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FaPlus /> إضافة نوع جديد
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
          <table className="w-full text-right text-white">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-4">اسم النوع</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-10 text-center">جاري التحميل...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-gray-500">لا توجد أنواع مصاريف مسجلة</td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="border-t border-gray-700 hover:bg-gray-750 transition">
                    <td className="p-4 flex items-center gap-3">
                      <FaTag className="text-blue-400" />
                      {category.name}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        category.classification === 'تشغيلي' ? 'bg-green-900 text-green-300' :
                        category.classification === 'إداري' ? 'bg-orange-900 text-orange-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {category.classification}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => openModal(category)}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingCategory ? "تعديل نوع" : "إضافة نوع مصروف جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">اسم النوع</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="مثال: وقود، صيانة..."
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">التصنيف</label>
                <select
                  value={formData.classification}
                  onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="تشغيلي">تشغيلي</option>
                  <option value="إداري">إداري</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                  {editingCategory ? "تحديث" : "حفظ"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
