"use client";

import { useState, useEffect } from "react";
import { Package, Receipt, BarChart3, TrendingUp, GitBranch } from "lucide-react";
import { FaTruckLoading } from "react-icons/fa";
import Link from "next/link";
import Branch from "@/models/Branch";
// import { TodoItem } from "@/components/ui/todo-item";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  description: string;
}

export default function Home() {

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <h1 className="text-3xl font-bold text-white">نظام إدارة المخزون</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Link href="/inventory" className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center group">
            <Package className="h-12 w-12 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-white">المخزون</h2>
            <p className="text-blue-100 mt-2">إدارة المنتجات والمخزون</p>
          </Link>

          <Link href="/inventory/expected-sales" className="bg-gradient-to-br from-cyan-600 to-cyan-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center group">
            <TrendingUp className="h-12 w-12 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-white">التقارير</h2>
            <p className="text-cyan-100 mt-2">عرض تقارير المبيعات والمصروفات</p>
          </Link>

          <Link href="/finance/transactions" className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center group">
            <Receipt className="h-12 w-12 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-white">المعاملات</h2>
            <p className="text-green-100 mt-2">تسجيل وعرض المعاملات</p>
          </Link>

          <Link href="/finance/income-statement" className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center group">
            <BarChart3 className="h-12 w-12 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-white">قائمة الدخل</h2>
            <p className="text-purple-100 mt-2">عرض تقارير الإيرادات والمصروفات</p>
          </Link>

          <Link href="/branches" className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center group">
            <GitBranch className="h-12 w-12 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-white">قائمة الفروع</h2>
            <p className="text-purple-100 mt-2">
              إضافة وعرض الفروع
            </p>
          </Link>

          <Link href="/suppliers" className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center group">
            <FaTruckLoading className="h-12 w-12 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-white">إدارة الموردين</h2>
            <p className="text-indigo-100 mt-2">
              إضافة وعرض الموردين
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
