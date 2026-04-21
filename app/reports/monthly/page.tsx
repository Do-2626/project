'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowRight, FaChartLine, FaCalendar, FaMoneyBillWave, FaArrowTrendUp } from 'react-icons/fa6';
import DataTable from '@/components/DataTable';
import MonthlyPerformanceChart from '@/components/MonthlyPerformanceChart';
import PasswordPrompt from '@/components/PasswordPrompt';

export default function MonthlyReportsPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthorized) {
            fetch('/api/reports/monthly')
                .then(res => res.json())
                .then(data => {
                    setData(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isAuthorized]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#101922] flex items-center justify-center p-4">
                <div className="bg-[#1b2127] border border-[#3b4754] p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="size-16 bg-[#1173d4]/20 text-[#1173d4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FaChartLine className="text-3xl" />
                        </div>
                        <h1 className="text-2xl font-black text-white">تقارير الأداء الشهري</h1>
                        <p className="text-[#9cabba] text-sm mt-2">يرجى تأكيد الهوية للوصول إلى البيانات التحليلية</p>
                    </div>
                    <PasswordPrompt
                        onSuccess={() => setIsAuthorized(true)}
                        label="كلمة المرور"
                        buttonText="دخول التقارير"
                    />
                    <Link href="/" className="block text-center mt-6 text-[#9cabba] hover:text-white transition-colors text-sm">
                        العودة للرئيسية
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#101922] text-white font-cairo dir-rtl pb-20" dir="rtl">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#101922]/80 backdrop-blur-md border-b border-[#3b4754] p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="size-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all">
                            <FaArrowRight className="text-lg" />
                        </Link>
                        <h1 className="text-xl font-black">تحليلات الأداء الشهري</h1>
                    </div>
                    <div className="bg-[#1173d4]/10 text-[#1173d4] px-4 py-2 rounded-xl border border-[#1173d4]/20 text-xs font-bold">
                        توتى بيروتى - مركز البيانات
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
                {/* KPI Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#1b2127] border border-[#3b4754] p-6 rounded-3xl shadow-xl flex items-center gap-5">
                        <div className="size-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                            <FaMoneyBillWave className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-[#9cabba] text-xs font-bold uppercase tracking-wider">إجمالي المبيعات التاريخية</p>
                            <h2 className="text-2xl font-black mt-1">
                                {data.reduce((acc, curr) => acc + curr.sales, 0).toLocaleString('en-US')}
                                <span className="text-xs opacity-50 mr-2">د.ل</span>
                            </h2>
                        </div>
                    </div>

                    <div className="bg-[#1b2127] border border-[#3b4754] p-6 rounded-3xl shadow-xl flex items-center gap-5">
                        <div className="size-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                            <FaCalendar className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-[#9cabba] text-xs font-bold uppercase tracking-wider">متوسط الربح الشهري</p>
                            <h2 className="text-2xl font-black mt-1">
                                {(data.reduce((acc, curr) => acc + curr.netProfit, 0) / (data.length || 1)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                <span className="text-xs opacity-50 mr-2">د.ل</span>
                            </h2>
                        </div>
                    </div>

                    <div className="bg-[#1b2127] border border-[#3b4754] p-6 rounded-3xl shadow-xl flex items-center gap-5">
                        <div className="size-14 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center shrink-0">
                            <FaArrowTrendUp className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-[#9cabba] text-xs font-bold uppercase tracking-wider">أفضل شهر مبيعات</p>
                            <h2 className="text-2xl font-black mt-1">
                                {data.length > 0 ? (Math.max(...data.map(d => d.sales))).toLocaleString('en-US') : 0}
                                <span className="text-xs opacity-50 mr-2">د.ل</span>
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black">مقارنة أداء الشهور</h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#3b4754]"></div>
                    </div>
                    <MonthlyPerformanceChart data={data} />
                </div>

                {/* Table Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black">جدول البيانات الشهرية</h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#3b4754]"></div>
                    </div>
                    <div className="bg-[#1b2127] border border-[#3b4754] rounded-3xl overflow-hidden shadow-2xl">
                        <DataTable
                            data={data}
                            isLoading={loading}
                            emptyMessage="لا توجد بيانات تحليلية مسجلة"
                            columns={[
                                {
                                    header: "الشهر",
                                    className: "p-5 font-black text-blue-400",
                                    render: (row) => row.month
                                },
                                {
                                    header: "المبيعات",
                                    className: "p-5 text-center",
                                    render: (row) => row.sales.toLocaleString('en-US')
                                },
                                {
                                    header: "تكلفة البضاعة",
                                    className: "p-5 text-center text-gray-500",
                                    render: (row) => row.cogs.toLocaleString('en-US')
                                },
                                {
                                    header: "المصاريف",
                                    className: "p-5 text-center text-orange-400",
                                    render: (row) => row.expenses.toLocaleString('en-US')
                                },
                                {
                                    header: "إيرادات أخرى",
                                    className: "p-5 text-center text-cyan-400",
                                    render: (row) => row.otherIncome.toLocaleString('en-US')
                                },
                                {
                                    header: "صافي الربح",
                                    className: "p-5 text-center font-black",
                                    render: (row) => (
                                        <span className={row.netProfit >= 0 ? "text-green-500" : "text-red-500"}>
                                            {row.netProfit.toLocaleString('en-US')}
                                        </span>
                                    )
                                },
                                {
                                    header: "هامش الربح",
                                    className: "p-5 text-center",
                                    render: (row) => {
                                        const margin = (row.netProfit / (row.sales || 1)) * 100;
                                        return (
                                            <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded-lg">
                                                {margin.toFixed(1)}%
                                            </span>
                                        );
                                    }
                                }
                            ]}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
