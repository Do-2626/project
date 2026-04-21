"use client";

import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPlus, FaStore } from "react-icons/fa";

interface Branch {
  _id: string;
  name: string;
  location?: string;
  isActive: boolean;
  settlementType: "daily" | "weekly";
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({ name: "", location: "", settlementType: "daily" });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/branches");
      const data = await res.json();
      setBranches(data);
    } catch (error) {
      console.error("Failed to fetch branches", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBranch
        ? `/api/branches/${editingBranch._id}`
        : "/api/branches";
      const method = editingBranch ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", location: "", settlementType: "daily" });
        setEditingBranch(null);
        fetchBranches();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save branch");
      }
    } catch (error) {
      console.error("Error saving branch", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفرع؟")) return;
    try {
      const res = await fetch(`/api/branches/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchBranches();
      }
    } catch (error) {
      console.error("Error deleting branch", error);
    }
  };

  const openModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        location: branch.location || "",
        settlementType: branch.settlementType || "daily"
      });
    } else {
      setEditingBranch(null);
      setFormData({ name: "", location: "", settlementType: "daily" });
    }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaStore className="text-blue-400" />
              إدارة الفروع
            </h1>
            <p className="text-gray-400 mt-2">إضافة وتعديل فروع التوزيع</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold shadow-md transition-colors"
          >
            <FaPlus />
            إضافة فرع
          </button>
        </header>

        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <table className="w-full text-right text-gray-300">
            <thead className="bg-gray-700 text-gray-100 uppercase text-sm">
              <tr>
                <th className="px-6 py-4">اسم الفرع</th>
                <th className="px-6 py-4">الموقع</th>
                <th className="px-6 py-4">نوع التسوية</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-8">
                    جاري التحميل...
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    لا توجد فروع مضافة حالياً
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch._id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {branch.name}
                    </td>
                    <td className="px-6 py-4">{branch.location || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${branch.settlementType === 'weekly' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'}`}>
                        {branch.settlementType === 'weekly' ? 'أسبوعي' : 'يومي'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-4">
                      <button
                        onClick={() => openModal(branch)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="تعديل"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(branch._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="حذف"
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingBranch ? "تعديل الفرع" : "إضافة فرع جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">اسم الفرع</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">الموقع (اختياري)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">نوع التسوية</label>
                <select
                  value={formData.settlementType}
                  onChange={(e) =>
                    setFormData({ ...formData, settlementType: e.target.value as "daily" | "weekly" })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="daily">يومي (تسوية كل يوم)</option>
                  <option value="weekly">أسبوعي (تسوية في نهاية الأسبوع)</option>
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition-colors"
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
