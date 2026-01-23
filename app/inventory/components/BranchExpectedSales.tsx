"use client";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import DataTable from "@/components/DataTable";
import PasswordPrompt from "@/components/PasswordPrompt";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

export default function BranchExpectedSales() {
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [branchSelectedWeek, setBranchSelectedWeek] = useState(
        dayjs().startOf("day").subtract((dayjs().day() + 1) % 7, "day")
    );
    const [branchSelectedDate, setBranchSelectedDate] = useState(
        dayjs().format("YYYY-MM-DD")
    );
    const [branchReport, setBranchReport] = useState<any>(null);
    const [showProtected, setShowProtected] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [userRole, setUserRole] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [receivedAmount, setReceivedAmount] = useState<string>("");
    const [isSavingPayment, setIsSavingPayment] = useState(false);

    useEffect(() => {
        document.title = "مبيعات الفروع - توتى بيروتى";
        fetch("/api/branches")
            .then((res) => res.json())
            .then(setBranches);
    }, []);

    const fetchReport = () => {
        setIsLoading(true);
        let url = `/api/inventory/daily-report?`;
        if (branchSelectedDate === "ALL_WEEK") {
            const startStr = branchSelectedWeek.format("YYYY-MM-DD");
            const endStr = branchSelectedWeek.add(6, "day").format("YYYY-MM-DD");
            url += `startDate=${startStr}&endDate=${endStr}`;
        } else {
            url += `date=${branchSelectedDate}`;
        }

        if (selectedBranch) {
            url += `&branchId=${selectedBranch}`;
        }

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                setBranchReport(data);
                const initialEdits: Record<string, number> = {};
                data.report?.forEach((r: any) => {
                    initialEdits[r.product._id] = r.actualSalesAmount || 0;
                });
                setEditValues(initialEdits);
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchReport();
    }, [branchSelectedDate, selectedBranch, branchSelectedWeek]);

    const handleSaveActualSales = async () => {
        try {
            const saveDate = branchSelectedDate === "ALL_WEEK"
                ? branchSelectedWeek.format("YYYY-MM-DD")
                : branchSelectedDate;

            const response = await fetch("/api/inventory/expected-sales/actual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: saveDate,
                    branchId: selectedBranch,
                    isWeekly: branchSelectedDate === "ALL_WEEK",
                    sales: Object.entries(editValues).map(([productId, amount]) => {
                        const reportItem = branchReport.report.find((r: any) => r.product._id === productId);
                        return {
                            productId,
                            amount: Number(amount),
                            quantity: reportItem?.expectedSales || 0
                        };
                    })
                })
            });

            if (response.ok) {
                setIsEditing(false);
                fetchReport();
            }
        } catch (error) {
            console.error("Failed to save actual sales", error);
        }
    };

    const handleRecordPayment = async () => {
        if (!receivedAmount || Number(receivedAmount) <= 0) return;
        setIsSavingPayment(true);
        try {
            const saveDate = branchSelectedDate === "ALL_WEEK"
                ? branchSelectedWeek.format("YYYY-MM-DD")
                : branchSelectedDate;

            const response = await fetch("/api/finance/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "income",
                    amount: Number(receivedAmount),
                    category: "تحصيل من عهدة الفرع",
                    description: `تحصيل مالي من عهدة الفرع (${currentBranch?.name})`,
                    date: saveDate,
                    branchId: selectedBranch,
                    party: currentBranch?.name
                }),
            });

            if (response.ok) {
                setReceivedAmount("");
                fetchReport();
            }
        } catch (error) {
            console.error("Failed to record payment", error);
        } finally {
            setIsSavingPayment(false);
        }
    };

    const currentBranch = branches.find(b => b._id === selectedBranch);
    const isWeeklyMatch = currentBranch?.settlementType === 'weekly' && branchSelectedDate === "ALL_WEEK";
    const isDailyMatch = (currentBranch?.settlementType === 'daily' || !currentBranch?.settlementType) && branchSelectedDate !== "ALL_WEEK";
    const canEdit = selectedBranch && userRole === "manager" && (isWeeklyMatch || isDailyMatch);

    return (
        <div className="min-h-screen bg-[#101922] text-white font-cairo dir-rtl" dir="rtl">
            <style jsx>{`
                .custom-select-arrow {
                    appearance: none;
                    background-image: url(https://lh3.googleusercontent.com/aida-public/AB6AXuBbdRqVLtUKb8asb5oY4lCtFtQhLT4uoaAdKxSX_nrf9f8BJhUqMFE4kVyF23OOu4AEr_NkLbipBs_VncdeeBtqi3CvM9uu-ZVrMLSzCgvCjinOQsmI6Ha515nX5Jw0jrVfrVPmjIcMoe1bKDruihfGGleBe-JhUdr9HjG2qUzK5PK7cRlW-cm6TCq2HYUGrv8Ba32iMf1Z4dRsAaZz9l-ZLzgxxS3KdZqo_MdBg1rKA_cDh4VeTozSonMGDAx9JlIrZEXGpLFPSAQ6);
                    background-repeat: no-repeat;
                    background-position: left 0.75rem center;
                    background-size: 1.25rem;
                }
            `}</style>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#111418]/95 backdrop-blur-md border-b border-[#3b4754]">
                <div className="max-w-7xl mx-auto flex items-center p-4 justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center justify-center size-10 rounded-full hover:bg-[#3b4754]/50 transition-colors">
                            <FaArrowRight className="text-white text-xl" />
                        </Link>
                        <h2 className="text-white text-lg md:text-xl font-bold leading-tight tracking-tight">تقارير المبيعات والمصروفات</h2>
                    </div>
                    {canEdit && (
                        <button
                            onClick={() => isEditing ? handleSaveActualSales() : setIsEditing(true)}
                            className="bg-[#0d7ff2] hover:bg-[#0d7ff2]/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg active:scale-95"
                        >
                            {isEditing ? 'حفظ المبيعات' : 'تعديل المبيعات'}
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                {/* Manager Mode Section */}
                <div className="flex items-center justify-between gap-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className={`size-2.5 rounded-full ${showProtected ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                        <div className="flex flex-col">
                            <p className={`${showProtected ? 'text-green-500' : 'text-gray-400'} text-sm font-bold leading-tight`}>
                                {showProtected ? 'وضع المدير مفعل' : 'وضع المدير غير نشط'}
                            </p>
                            <p className="text-gray-500 text-xs font-normal">
                                {showProtected ? 'Manager Mode Enabled' : 'Manager Mode Disabled'}
                            </p>
                        </div>
                    </div>
                    <label className="relative flex h-[28px] w-[48px] cursor-pointer items-center rounded-full border-none bg-gray-700 p-0.5 transition-colors">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={showProtected}
                            onChange={(e) => {
                                if (!showProtected) {
                                    setShowPasswordModal(true);
                                } else {
                                    setShowProtected(false);
                                    setUserRole("");
                                }
                            }}
                        />
                        <div className={`h-full w-[24px] rounded-full bg-white transition-all shadow-md ${showProtected ? 'mr-[20px]' : 'mr-0'}`}></div>
                    </label>
                </div>

                {/* Password Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[#1b2127] border border-[#3b4754] p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">تفعيل وضع المدير</h3>
                            <PasswordPrompt
                                onSuccess={(role) => {
                                    setShowProtected(true);
                                    setUserRole(role || "manager");
                                    setShowPasswordModal(false);
                                }}
                                label="أدخل كلمة مرور المدير لرؤية التكاليف"
                                buttonText="فتح البيانات المالية"
                            />
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="w-full mt-3 text-gray-500 hover:text-white text-sm"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                )}

                {/* Filter Section */}
                <section className="bg-[#1b2127]/30 p-5 rounded-2xl border border-[#3b4754]/50 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5 lg:col-span-2">
                            <label className="text-[#9cabba] text-sm font-medium px-1">نطاق الأسبوع</label>
                            <select
                                className="custom-select-arrow w-full rounded-xl text-white border border-[#3b4754] bg-[#1b2127] focus:border-[#0d7ff2] focus:ring-1 focus:ring-[#0d7ff2] h-12 px-4 text-base font-normal outline-none transition-all shadow-sm"
                                value={branchSelectedWeek.format("YYYY-MM-DD")}
                                onChange={(e) => {
                                    const newWeek = dayjs(e.target.value);
                                    setBranchSelectedWeek(newWeek);
                                    setBranchSelectedDate("ALL_WEEK");
                                }}
                            >
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const start = dayjs().startOf("day").subtract((dayjs().day() + 1) % 7, "day").subtract(i, "week");
                                    const end = start.add(6, "day");
                                    return (
                                        <option key={i} value={start.format("YYYY-MM-DD")}>
                                            الأسبوع الحالي ({start.format("D")} - {end.format("D MMMM")})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[#9cabba] text-sm font-medium px-1">اليوم</label>
                            <select
                                className="custom-select-arrow w-full rounded-xl text-white border border-[#3b4754] bg-[#1b2127] focus:border-[#0d7ff2] focus:ring-1 focus:ring-[#0d7ff2] h-12 px-4 text-base font-normal outline-none transition-all shadow-sm"
                                value={branchSelectedDate}
                                onChange={(e) => setBranchSelectedDate(e.target.value)}
                            >
                                <option value="ALL_WEEK">كل أيام الأسبوع</option>
                                {Array.from({ length: 7 }).map((_, i) => {
                                    const date = branchSelectedWeek.add(i, "day");
                                    return (
                                        <option key={i} value={date.format("YYYY-MM-DD")}>
                                            {date.format("dddd")} ({date.format("YYYY-MM-DD")})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[#9cabba] text-sm font-medium px-1">الفرع / المندوب</label>
                            <select
                                className="custom-select-arrow w-full rounded-xl text-white border border-[#3b4754] bg-[#1b2127] focus:border-[#0d7ff2] focus:ring-1 focus:ring-[#0d7ff2] h-12 px-4 text-base font-normal outline-none transition-all shadow-sm"
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                            >
                                <option value="">جميع الفروع (مندوبين)</option>
                                {branches.map((b) => (
                                    <option key={b._id} value={b._id}>
                                        {b.name} ({b.settlementType === 'weekly' ? 'أسبوعي' : 'يومي'})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={fetchReport}
                            className="w-full bg-[#0d7ff2] hover:bg-[#0d7ff2]/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "تطبيق الفلاتر"
                            )}
                        </button>
                    </div>
                </section>


                {/* Table Section */}
                {selectedBranch && (<div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-white">مبيعات الفرع - {currentBranch?.settlementType === 'weekly' ? 'أسبوعي' : 'يومي'}</h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#3b4754]"></div>
                </div>)}

                <div className="overflow-hidden rounded-2xl border border-[#3b4754]/50 bg-[#1b2127]/50 shadow-2xl">
                    <DataTable
                        data={branchReport?.report?.filter((r: any) => r.expectedSales !== 0) || []}
                        isLoading={isLoading}
                        emptyMessage="لا توجد بيانات للفترة المحددة"
                        columns={[
                            {
                                header: "الصنف",
                                className: "p-4 text-right",
                                render: (r: any) => (
                                    <span className="font-bold text-gray-200">{r.product.name}</span>
                                ),
                            },
                            {
                                header: "الكمية المتوقعة",
                                className: "p-4 text-center",
                                render: (r: any) => (
                                    <span className="text-[#0d7ff2] font-black text-xl">{r.expectedSales}</span>
                                ),
                                footer: (data) => (
                                    <span className="text-[#0d7ff2]">{data.reduce((acc: number, r: any) => acc + (r.expectedSales || 0), 0)}</span>
                                )
                            },
                            {
                                header: "إجمالي المبيعات",
                                className: "p-4 text-center",
                                render: (r: any) => isEditing ? (
                                    <input
                                        type="number"
                                        className="bg-[#101922] border border-[#0d7ff2] text-white rounded-lg p-2 w-28 text-center outline-none focus:ring-1 focus:ring-[#0d7ff2]"
                                        value={editValues[r.product._id] || 0}
                                        onChange={(e) => setEditValues({ ...editValues, [r.product._id]: Number(e.target.value) })}
                                    />
                                ) : (
                                    <span className="text-yellow-500 font-bold">
                                        {(r.actualSalesAmount || 0).toLocaleString()} <span className="text-[10px] opacity-70"> </span>
                                    </span>
                                ),
                                footer: (data) => (
                                    <span className="text-yellow-500">
                                        {data.reduce((acc: number, r: any) => acc + (r.actualSalesAmount || 0), 0).toLocaleString()} <span className="text-[10px]"> </span>
                                    </span>
                                )
                            },
                            ...(showProtected
                                ? [
                                    {
                                        header: "التكلفة",
                                        className: "p-4 text-center",
                                        render: (r: any) => (
                                            <span className="text-green-500 font-semibold">
                                                {(r.expectedSales * (r.product.purchasePrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        ),
                                        footer: (data: any) => (
                                            <span className="text-green-500">
                                                {data.reduce((acc: number, r: any) => acc + (r.expectedSales * (r.product.purchasePrice || 0)), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        )
                                    },
                                ]
                                : []),
                        ]}
                        showTotal={true}
                        className="border-none"
                    />
                </div>

                {/* Financial Summary Section */}
                {selectedBranch && branchReport && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-[#1b2127]/80 p-6 rounded-2xl border border-[#3b4754] shadow-xl">
                            <span className="text-[#9cabba] text-[10px] font-black uppercase tracking-widest block mb-1">إجمالي المبيعات الفعلية</span>
                            <span className="text-yellow-500 font-black text-2xl">
                                {branchReport.report.reduce((acc: number, r: any) => acc + (r.actualSalesAmount || 0), 0).toLocaleString()}
                                <span className="text-sm opacity-60 mr-1">د.ل</span>
                            </span>
                        </div>
                        <div className="bg-[#1b2127]/80 p-6 rounded-2xl border border-[#3b4754] shadow-xl">
                            <span className="text-[#9cabba] text-[10px] font-black uppercase tracking-widest block mb-1">إجمالي المصروفات</span>
                            <span className="text-orange-500 font-black text-2xl">
                                {branchReport.during.filter((t: any) => t.isFinancial && t.type === 'expense').reduce((acc: number, t: any) => acc + (t.amount || 0), 0).toLocaleString()}
                                <span className="text-sm opacity-60 mr-1">د.ل</span>
                            </span>
                        </div>
                        <div className="bg-[#1173d4]/10 p-6 rounded-2xl border border-[#1173d4]/30 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#1173d4]"></div>
                            <span className="text-[#1173d4] text-[10px] font-black uppercase tracking-widest block mb-1">صافي مستحقات الفرع</span>
                            <span className="text-white font-black text-2xl">
                                {(
                                    branchReport.report.reduce((acc: number, r: any) => acc + (r.actualSalesAmount || 0), 0) -
                                    branchReport.during.filter((t: any) => t.isFinancial && t.type === 'expense').reduce((acc: number, t: any) => acc + (t.amount || 0), 0)
                                ).toLocaleString()}
                                <span className="text-sm opacity-60 mr-1">د.ل</span>
                            </span>
                        </div>
                        <div className="bg-green-500/10 p-6 rounded-2xl border border-green-500/30 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                            <span className="text-green-500 text-[10px] font-black uppercase tracking-widest block mb-1">المبالغ المسلمة (المحصلة)</span>
                            <span className="text-white font-black text-2xl">
                                {branchReport.during.filter((t: any) => t.isFinancial && t.type === 'income' && t.category === "تحصيل من عهدة الفرع").reduce((acc: number, t: any) => acc + (t.amount || 0), 0).toLocaleString()}
                                <span className="text-sm opacity-60 mr-1">د.ل</span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Collection Form & Remaining Balance */}
                {selectedBranch && branchReport && (
                    <div className="bg-[#1c2127] border border-[#3b4754] rounded-2xl p-6 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1 w-full">
                                <label className="block mb-2 text-sm font-bold text-gray-400">تسجيل مبلغ مستلم من المندوب</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="أدخل المبلغ هنا..."
                                        className="flex-1 bg-[#101922] border border-[#3b4754] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1173d4] transition-all"
                                        value={receivedAmount}
                                        onChange={(e) => setReceivedAmount(e.target.value)}
                                    />
                                    <button
                                        onClick={handleRecordPayment}
                                        disabled={isSavingPayment || !receivedAmount}
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-green-500/20"
                                    >
                                        {isSavingPayment ? "جاري الحفظ..." : "تأكيد التحصيل"}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-[#101922] px-8 py-5 rounded-2xl border border-[#3b4754] text-center min-w-[200px]">
                                <span className="text-[#9cabba] text-xs font-bold block mb-1 text-right">الرصيد المتبقي في العهدة</span>
                                <div className="flex items-center justify-center gap-2">
                                    <span className={`text-3xl font-black ${(
                                        branchReport.report.reduce((acc: number, r: any) => acc + (r.actualSalesAmount || 0), 0) -
                                        branchReport.during.filter((t: any) => t.isFinancial && t.type === 'expense').reduce((acc: number, t: any) => acc + (t.amount || 0), 0) -
                                        branchReport.during.filter((t: any) => t.isFinancial && t.type === 'income' && t.category === "تحصيل من عهدة الفرع").reduce((acc: number, t: any) => acc + (t.amount || 0), 0)
                                    ) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {(
                                            branchReport.report.reduce((acc: number, r: any) => acc + (r.actualSalesAmount || 0), 0) -
                                            branchReport.during.filter((t: any) => t.isFinancial && t.type === 'expense').reduce((acc: number, t: any) => acc + (t.amount || 0), 0) -
                                            branchReport.during.filter((t: any) => t.isFinancial && t.type === 'income' && t.category === "تحصيل من عهدة الفرع").reduce((acc: number, t: any) => acc + (t.amount || 0), 0)
                                        ).toLocaleString()}
                                    </span>
                                    <span className="text-sm opacity-60">د.ل</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expenses Section */}
                {selectedBranch && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-white">مصروفات الفرع</h3>
                            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#3b4754]"></div>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-[#3b4754]/50 bg-[#1b2127]/50 shadow-2xl">
                            <DataTable
                                data={branchReport?.during?.filter((t: any) => t.isFinancial && t.type === 'expense') || []}
                                isLoading={isLoading}
                                emptyMessage="لا توجد مصروفات مسجلة لهذا الفرع في الفترة المختارة"
                                columns={[
                                    {
                                        header: "التاريخ",
                                        className: "p-4 text-xs font-bold text-gray-400",
                                        render: (t: any) => dayjs(t.date).format("D/M/YYYY")
                                    },
                                    {
                                        header: "نوع المصروف",
                                        className: "p-4",
                                        render: (t: any) => (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-200">{t.expenseCategoryId?.name || t.category}</span>
                                                {t.expenseSubtype && <span className="text-[10px] text-gray-500">{t.expenseSubtype}</span>}
                                            </div>
                                        )
                                    },
                                    {
                                        header: "الوصف",
                                        className: "p-4 text-right flex-1",
                                        render: (t: any) => <span className="text-sm text-gray-400">{t.description || "-"}</span>
                                    },
                                    {
                                        header: "المبلغ",
                                        className: "p-4 text-center",
                                        render: (t: any) => (
                                            <span className="text-orange-500 font-black">
                                                {t.amount?.toLocaleString()} <span className="text-[10px]">د.ل</span>
                                            </span>
                                        ),
                                        footer: (data) => (
                                            <span className="text-orange-500 font-black">
                                                {data.reduce((acc: number, t: any) => acc + (t.amount || 0), 0).toLocaleString()}
                                            </span>
                                        )
                                    }
                                ]}
                                showTotal={true}
                                className="border-none"
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Gap for bottom navigation if any */}
            <div className="h-10"></div>
        </div>
    );
}
