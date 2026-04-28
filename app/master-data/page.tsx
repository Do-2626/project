// app/master-data/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
    FaStore,
    FaBox,
    FaPhone,
    FaTruck,
    FaTag,
    FaPlus,
    FaTrash,
    FaEdit,
} from "react-icons/fa";
import PasswordPrompt from "@/components/PasswordPrompt";
import Modal from "@/components/Modal";

interface Branch {
    _id: string;
    name: string;
    location?: string;
    isActive: boolean;
    settlementType: "daily" | "weekly";
}

interface Product {
    _id: string;
    name: string;
    weight?: string;
    purchasePrice: number;
    sellingPrice: number;
}

interface Contact {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
}

interface Supplier {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
}

interface ExpenseCategory {
    _id: string;
    name: string;
    description?: string;
}

export default function MasterDataPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [activeTab, setActiveTab] = useState<"branches" | "products" | "contacts" | "suppliers" | "categories">("branches");
    const [loading, setLoading] = useState(false);

    // Data states
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);

    // Modal states
    const [modal, setModal] = useState({ open: false, type: "", data: null });
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (isAuthorized) {
            fetchAllData();
        }
    }, [isAuthorized]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/v2/master-data");
            const data = await res.json();
            setBranches(data.branches);
            setProducts(data.products);
            setContacts(data.contacts);
            setSuppliers(data.suppliers);
            setCategories(data.categories);
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (type: string, id: string) => {
        // التأكيد قبل الحذف لتعزيز الـ Accessibility وتجنب الأخطاء
        if (!confirm("هل أنت متأكد من رغبتك في حذف هذا العنصر؟")) return;

        try {
            // توحيد بناء الرابط بناءً على النوع
            // ملاحظة: تم تعديل المسارات لتطابق الـ API الفعلي في المصادر [9، 19، 41]
            const apiPath = type === 'products' ? '/api/inventory/products' : `/api/${type}`;

            const res = await fetch(`${apiPath}/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("فشل عملية الحذف");

            // تحديث الواجهة فوراً دون الحاجة لإعادة تحميل كل البيانات
            const setterMap: any = {
                branches: setBranches,
                products: setProducts,
                contacts: setContacts,
                suppliers: setSuppliers,
                categories: setCategories,
            };

            setterMap[type]((prev: any[]) => prev.filter((item) => item._id !== id));

            alert("تم الحذف بنجاح");
        } catch (error: any) {
            alert(error.message);
        }
    };


    // Tab component
    const TabButton = ({
        name,
        icon: Icon,
        label,
    }: {
        name: "branches" | "products" | "contacts" | "suppliers" | "categories";
        icon: React.ComponentType<any>;
        label: string;
    }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === name
                ? "bg-[#1173d4] text-white shadow-lg shadow-[#1173d4]/30"
                : "bg-[#101922] text-[#9cabba] hover:bg-[#1b2127]"
                }`}
        >
            <Icon className="text-lg" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    // Content sections
    const renderBranches = () => (
        <div className="space-y-4">
            <button
                onClick={() => setModal({ open: true, type: "addBranch", data: null })}
                className="bg-[#1173d4] hover:bg-[#1100f4] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95"
            >
                <FaPlus /> فرع جديد
            </button>
            <div className="space-y-2">
                {branches.map((branch) => (
                    <div
                        key={branch._id}
                        className="bg-[#1b2127] border border-[#3b4754] p-4 rounded-lg flex justify-between items-center"
                    >
                        <div>
                            <p className="text-white font-bold">{branch.name}</p>
                            <p className="text-[#9cabba] text-sm">{branch.location}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDelete("branches", branch._id)}
                                className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-lg transition-all"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderProducts = () => (
        <div className="space-y-4">
            <button
                onClick={() => setModal({ open: true, type: "addProduct", data: null })}
                className="bg-[#1173d4] hover:bg-[#1100f4] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95"
            >
                <FaPlus /> منتج جديد
            </button>
            <div className="space-y-2">
                {products.map((product) => (
                    <div
                        key={product._id}
                        className="bg-[#1b2127] border border-[#3b4754] p-4 rounded-lg flex justify-between items-center"
                    >
                        <div>
                            <p className="text-white font-bold">{product.name}</p>
                            <p className="text-[#9cabba] text-sm">
                                الشراء: {product.purchasePrice} | البيع: {product.sellingPrice}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDelete("products", product._id)}
                                className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-lg transition-all"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContacts = () => (
        <div className="space-y-4">
            <button
                onClick={() => setModal({ open: true, type: "addContact", data: null })}
                className="bg-[#1173d4] hover:bg-[#1100f4] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95"
            >
                <FaPlus /> جهة اتصال جديدة
            </button>
            <div className="space-y-2">
                {contacts.map((contact) => (
                    <div
                        key={contact._id}
                        className="bg-[#1b2127] border border-[#3b4754] p-4 rounded-lg flex justify-between items-center"
                    >
                        <div>
                            <p className="text-white font-bold">{contact.name}</p>
                            <p className="text-[#9cabba] text-sm">{contact.phone}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDelete("contacts", contact._id)}
                                className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-lg transition-all"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSuppliers = () => (
        <div className="space-y-4">
            <button
                onClick={() => setModal({ open: true, type: "addSupplier", data: null })}
                className="bg-[#1173d4] hover:bg-[#1100f4] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95"
            >
                <FaPlus /> مورد جديد
            </button>
            <div className="space-y-2">
                {suppliers.map((supplier) => (
                    <div
                        key={supplier._id}
                        className="bg-[#1b2127] border border-[#3b4754] p-4 rounded-lg flex justify-between items-center"
                    >
                        <div>
                            <p className="text-white font-bold">{supplier.name}</p>
                            <p className="text-[#9cabba] text-sm">{supplier.phone}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDelete("suppliers", supplier._id)}
                                className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-lg transition-all"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCategories = () => (
        <div className="space-y-4">
            <button
                onClick={() => setModal({ open: true, type: "addCategory", data: null })}
                className="bg-[#1173d4] hover:bg-[#1100f4] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95"
            >
                <FaPlus /> فئة جديدة
            </button>
            <div className="space-y-2">
                {categories.map((category) => (
                    <div
                        key={category._id}
                        className="bg-[#1b2127] border border-[#3b4754] p-4 rounded-lg flex justify-between items-center"
                    >
                        <div>
                            <p className="text-white font-bold">{category.name}</p>
                            <p className="text-[#9cabba] text-sm">{category.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDelete("categories", category._id)}
                                className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-lg transition-all"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <PasswordPrompt
                        onSuccess={() => setIsAuthorized(true)}
                        label="كلمة المرور للوصول إلى إدارة البيانات المركزية"
                        buttonText="فتح"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1419]">
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        إدارة البيانات المركزية
                    </h1>
                    <p className="text-[#9cabba]">
                        إدارة الفروع والمنتجات وجهات الاتصال والموردين والفئات
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <TabButton name="branches" icon={FaStore} label="الفروع" />
                    <TabButton name="products" icon={FaBox} label="المنتجات" />
                    <TabButton name="contacts" icon={FaPhone} label="جهات الاتصال" />
                    <TabButton name="suppliers" icon={FaTruck} label="الموردين" />
                    <TabButton name="categories" icon={FaTag} label="الفئات" />
                </div>

                {/* Content */}
                <div className="bg-[#101922] border border-[#3b4754] rounded-2xl p-6">
                    {loading ? (
                        <div className="text-center text-[#9cabba]">جاري التحميل...</div>
                    ) : (
                        <>
                            {activeTab === "branches" && renderBranches()}
                            {activeTab === "products" && renderProducts()}
                            {activeTab === "contacts" && renderContacts()}
                            {activeTab === "suppliers" && renderSuppliers()}
                            {activeTab === "categories" && renderCategories()}
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                open={modal.open}
                onClose={() => setModal({ open: false, type: "", data: null })}
                onSuccess={fetchAllData}
                type={modal.type}
                data={modal.data}
                products={products}
            />
        </div>
    );
}
