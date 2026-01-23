"use client";

import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPlus, FaTruckLoading } from "react-icons/fa";
import PasswordPrompt from "@/components/PasswordPrompt";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

interface Supplier {
    _id: string;
    name: string;
    phone?: string;
    type: string;
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({ name: "", phone: "", type: "supplier" });

    useEffect(() => {
        if (isAuthorized) {
            fetchSuppliers();
        }
    }, [isAuthorized]);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/contacts?type=supplier");
            const data = await res.json();
            setSuppliers(data);
        } catch (error) {
            console.error("Failed to fetch suppliers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingSupplier
                ? `/api/contacts/${editingSupplier._id}`
                : "/api/contacts";
            const method = editingSupplier ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({ name: "", phone: "", type: "supplier" });
                setEditingSupplier(null);
                fetchSuppliers();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to save supplier");
            }
        } catch (error) {
            console.error("Error saving supplier", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا المورد؟")) return;
        try {
            const res = await fetch(`/api/contacts/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchSuppliers();
            }
        } catch (error) {
            console.error("Error deleting supplier", error);
        }
    };

    const openModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                phone: supplier.phone || "",
                type: "supplier"
            });
        } else {
            setEditingSupplier(null);
            setFormData({ name: "", phone: "", type: "supplier" });
        }
        setShowModal(true);
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#101922] p-6">
                <div className="max-w-4xl mx-auto bg-[#1b2127] border border-[#3b4754] p-8 rounded-2xl shadow-2xl mt-20">
                    <h1 className="text-3xl font-bold text-center text-white mb-8">
                        إدارة الموردين
                    </h1>
                    <PasswordPrompt
                        onSuccess={() => setIsAuthorized(true)}
                        label="أدخل كلمة المرور للوصول"
                        buttonText="تأكيد"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#101922] p-6 font-cairo dir-rtl" dir="rtl">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-[#1b2127] p-6 rounded-2xl shadow-lg border border-[#3b4754]">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center justify-center size-10 rounded-full hover:bg-white/5 transition-colors">
                            <FaArrowRight className="text-white text-xl" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <FaTruckLoading className="text-blue-500" />
                                إدارة الموردين
                            </h1>
                            <p className="text-[#9cabba] mt-1 text-sm">إضافة وتعديل بيانات الموردين</p>
                        </div>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-[#1173d4] hover:bg-[#1100f4] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-xl transition-all active:scale-95"
                    >
                        <FaPlus />
                        إضافة مورد
                    </button>
                </header>

                <div className="bg-[#1b2127] rounded-2xl shadow-2xl border border-[#3b4754] overflow-hidden">
                    <table className="w-full text-right text-gray-300">
                        <thead className="bg-[#101922] text-gray-100 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-5">اسم المورد</th>
                                <th className="px-6 py-5">رقم الهاتف</th>
                                <th className="px-6 py-5 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-12">
                                        <div className="flex justify-center flex-col items-center gap-3">
                                            <div className="size-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                            <span className="text-sm font-bold text-blue-500">جاري التحميل...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-12 text-[#9cabba]">
                                        لا يوجد موردون مضافون حالياً
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier) => (
                                    <tr key={supplier._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-5 font-bold text-white">
                                            {supplier.name}
                                        </td>
                                        <td className="px-6 py-5 text-sm">{supplier.phone || "-"}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => openModal(supplier)}
                                                    className="bg-blue-500/10 text-blue-500 p-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-inner"
                                                    title="تعديل"
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(supplier._id)}
                                                    className="bg-red-500/10 text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-inner"
                                                    title="حذف"
                                                >
                                                    <FaTrash size={16} />
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
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-[#1b2127] rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[#3b4754]">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {editingSupplier ? "تعديل بيانات مورد" : "إضافة مورد جديد"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[#9cabba] text-sm font-bold mb-2">اسم المورد</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full bg-[#101922] border border-[#3b4754] rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="اسم الشركة أو المورد"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[#9cabba] text-sm font-bold mb-2">رقم الهاتف (اختياري)</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    className="w-full bg-[#101922] border border-[#3b4754] rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="091XXXXXXX"
                                />
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-all"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#1173d4] hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                                >
                                    حفظ البيانات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
