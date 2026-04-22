"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { FaChevronDown, FaChevronUp, FaTrashCan, FaPlus, FaMinus, FaCalendarDays, FaFilter } from "react-icons/fa6";
import isBetween from "dayjs/plugin/isBetween";
import ExportButtonCSV from "@/components/ExportButtonCSV";
import PasswordPrompt from "@/components/PasswordPrompt";
import Modal from "@/components/Modal";
import DataTable from "@/components/DataTable";

dayjs.extend(isBetween);

interface WeeklyLogProps {
  iconMap?: Record<string, React.ReactNode>;
}

const typeLabels: Record<string, string> = {
  purchase: "مشتريات",
  outgoing: "تحميل",
  incoming: "مرتجع",
  damaged: "تالف",
  sale: "بيع",
  expense: "مصروف",
};

export default function WeeklyLog({ iconMap }: WeeklyLogProps) {
  const currentSaturday = dayjs().startOf("day").subtract((dayjs().day() + 1) % 7, "day");
  const today = dayjs().format("YYYY-MM-DD");

  const [selectedWeek, setSelectedWeek] = useState(currentSaturday);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProtected, setShowProtected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [partyFilter, setPartyFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const weeks = Array.from({ length: 12 }).map((_, i) => {
    const start = currentSaturday.subtract(i, "week");
    const end = start.add(6, "day");
    return { start, end };
  });

  const fetchWeeklyTransactions = async () => {
    setIsLoading(true);
    const startStr = selectedWeek.format("YYYY-MM-DD");
    const endStr = selectedWeek.add(6, "day").format("YYYY-MM-DD");

    try {
      const res = await fetch(`/api/inventory/weekly-report?startDate=${startStr}&endDate=${endStr}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch weekly transactions", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyTransactions();
  }, [selectedWeek]);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTxId(id);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async (id: string) => {
    setIsModalOpen(false);
    const txToDelete = transactions.find((t: any) => t._id === id);
    const url = txToDelete?.isFinancial
      ? `/api/finance/transactions?id=${id}`
      : `/api/transactions/${id}`;

    try {
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        setTransactions(prev => prev.filter(t => t._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const uniqueParties = Array.from(
    new Set(transactions.map((t: any) => t.branchId?.name || t.party || "-"))
  ).filter(p => p !== "-");

  const filteredTransactions = transactions.filter((t: any) => {
    // Logic: show today's and all if showProtected is true
    const isPublic = t.date === today;
    if (!showProtected && !isPublic) return false;

    const typeMatch = !typeFilter || t.type === typeFilter;
    const partyName = t.branchId?.name || t.party || "-";
    const partyMatch = !partyFilter || partyName === partyFilter;
    return typeMatch && partyMatch;
  });

  return (
    <div className="bg-[#1c2127]/50 border border-[#3b4754] rounded-2xl shadow-xl overflow-hidden">
      {/* Enhanced Header with Filters */}
      <div className="bg-[#1b2127] p-4 md:p-6 border-b border-[#3b4754]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Title Section */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 bg-[#1173d4]/10 rounded-2xl text-[#1173d4] hover:bg-[#1173d4] hover:text-white transition-all cursor-pointer shadow-inner group"
            >
              <FaCalendarDays className="text-lg group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                سجل العمليات الأسبوعي
                {isOpen ? <FaChevronUp className="text-[10px] opacity-30" /> : <FaChevronDown className="text-[10px] opacity-30" />}
              </h3>
              <p className="text-[#9cabba] text-[10px] font-bold uppercase tracking-widest opacity-60">تتبع وحماية البيانات المالية</p>
            </div>
          </div>

          {isOpen && showProtected && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="size-11 flex items-center justify-center bg-[#1173d4] text-white rounded-xl shadow-lg hover:bg-[#1100f4] transition-all active:scale-95 group"
                title="تصفية النتائج"
              >
                <FaFilter className="text-lg group-hover:rotate-12 transition-transform" />
              </button>

              <div className="hidden md:block h-8 w-[1px] bg-white/10 mx-2"></div>

              <ExportButtonCSV
                data={filteredTransactions}
                fileName={`log-${selectedWeek.format("YYYY-MM-DD")}`}
                label="تصدير السجل"
              />

              {(typeFilter || partyFilter) && (
                <button
                  onClick={() => { setTypeFilter(""); setPartyFilter(""); }}
                  className="px-4 h-11 flex items-center justify-center bg-red-400/10 text-red-100 border border-red-400/20 hover:bg-red-400 hover:text-white rounded-xl transition-all shadow-sm text-xs font-bold gap-2"
                >
                  <FaFilter className="text-[10px]" />
                  إعادة تعيين
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-0">
          {!showProtected ? (
            <div className="flex flex-col gap-6 p-6">
              {/* Public Today's Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[#1173d4] font-bold text-xs bg-[#1173d4]/10 px-3 py-1 rounded-full border border-[#1173d4]/20">
                    عمليات اليوم ({dayjs().format("M/D")})
                  </span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#3b4754]"></div>
                </div>

                <DataTable
                  data={transactions.filter(t => t.date === today)}
                  isLoading={isLoading}
                  emptyMessage="لا توجد عمليات مسجلة لهذا اليوم"
                  columns={[
                    {
                      header: "التاريخ",
                      className: "p-4 text-xs font-bold",
                      render: (t: any) => <span>{dayjs(t.date).format("D/M")}</span>
                    },
                    {
                      header: "النوع",
                      className: "p-4",
                      render: (t: any) => (
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.type === 'purchase' ? 'bg-green-500/10 text-green-500' :
                            t.type === 'outgoing' ? 'bg-red-500/10 text-red-500' :
                              'bg-orange-500/10 text-orange-500'
                            }`}>
                            {typeLabels[t.type]}
                          </span>
                        </div>
                      )
                    },
                    {
                      header: "البيان",
                      className: "p-4 text-right flex-1",
                      render: (t: any) => (
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{t.isFinancial ? (t.expenseCategoryId?.name || t.category) : t.productId?.name}</span>
                          <span className="text-[10px] text-[#9cabba]">{t.branchId?.name || t.party || "-"}</span>
                        </div>
                      )
                    },
                    {
                      header: "الكمية / المبلغ",
                      className: "p-4 text-center",
                      render: (t: any) => (
                        <span className={`font-black ${t.isFinancial ? 'text-orange-500' : 'text-white'}`}>
                          {t.isFinancial ? `${t.amount?.toLocaleString()} د.ل` : t.quantity}
                        </span>
                      )
                    },
                    {
                      header: "",
                      className: "p-4 text-center w-10",
                      render: (t: any) => (
                        <button
                          onClick={(e) => handleDeleteClick(t._id, e)}
                          className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <FaTrashCan className="text-sm" />
                        </button>
                      )
                    }
                  ]}
                />
              </div>

              {/* Password Prompt for Full History */}
              <div className="bg-[#1173d4]/5 border border-[#1173d4]/20 rounded-2xl p-8 max-w-lg mx-auto w-full text-center">
                <h4 className="text-white font-bold mb-2">عرض السجل الكامل</h4>
                <p className="text-[#9cabba] text-xs mb-6">يرجى إدخال كلمة المرور لعرض كامل عمليات الأسبوع والبيانات المالية</p>
                <PasswordPrompt
                  onSuccess={() => setShowProtected(true)}
                  label="كلمة المرور"
                  buttonText="فتح السجل الكامل"
                />
              </div>
            </div>
          ) : (
            <div className="bg-[#1c2127]/30">
              <DataTable
                data={filteredTransactions}
                isLoading={isLoading}
                emptyMessage="لا توجد نتائج مطابقة"
                columns={[
                  {
                    header: "التاريخ",
                    className: "p-4 font-bold text-[#9cabba] text-xs",
                    render: (t: any) => <div className="flex flex-col">
                      <span>{dayjs(t.date).format("dddd")}</span>
                      <span className="text-[10px] opacity-70">{t.date}</span>
                    </div>
                  },
                  {
                    header: "النوع",
                    render: (t: any) => (
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${t.type === 'purchase' ? 'bg-green-500/20 text-green-500' :
                          t.type === 'outgoing' ? 'bg-red-500/20 text-red-500' :
                            t.type === 'incoming' ? 'bg-yellow-500/20 text-yellow-500' :
                              t.type === 'damaged' ? 'bg-purple-500/20 text-purple-500' :
                                'bg-orange-500/20 text-orange-500'
                          }`}>
                          <span className="material-symbols-outlined text-lg">
                            {t.type === 'purchase' ? 'shopping_cart' :
                              t.type === 'outgoing' ? 'upload' :
                                t.type === 'incoming' ? 'history' :
                                  t.type === 'damaged' ? 'delete' :
                                    'payments'}
                          </span>
                        </div>
                        <span className="font-bold text-xs">{typeLabels[t.type]}</span>
                      </div>
                    )
                  },
                  {
                    header: "الجهة / الصنف",
                    className: "p-4 text-right",
                    render: (t: any) => (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                          {t.isFinancial ? (t.expenseCategoryId?.name || t.category) : t.productId?.name}
                        </span>
                        <span className="text-[10px] text-[#9cabba] font-medium">
                          {t.branchId?.name || t.party || "بدون جهة"}
                          {t.isFinancial && t.expenseSubtype && ` • ${t.expenseSubtype}`}
                        </span>
                      </div>
                    )
                  },
                  {
                    header: "كمية",
                    className: "p-4 text-center font-black",
                    render: (t: any) => <span>{t.isFinancial ? "-" : t.quantity}</span>
                  },
                  {
                    header: "المبلغ",
                    className: "p-4 text-center",
                    render: (t: any) => (
                      <span className={`font-black text-sm text-orange-500`}>
                        {t.isFinancial ? `${t.amount?.toLocaleString()} د.ل` : "-"}
                      </span>
                    )
                  },
                  {
                    header: "",
                    className: "p-4 text-center w-10",
                    render: (t: any) => (
                      <button
                        onClick={(e) => handleDeleteClick(t._id, e)}
                        className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <FaTrashCan className="text-sm" />
                      </button>
                    )
                  }
                ]}
                showTotal={showProtected}
                rowClassName={(t: any) => t.date === today ? "bg-[#1173d4]/5" : ""}
              />
            </div>
          )}
        </div>
      )
      }

      <Modal
        open={isModalOpen}
        type="delete"
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { }}
        products={[]}
        selectedDate={null}
        transactionId={selectedTxId}
        onDeleteConfirm={handleDeleteConfirm}
      />

      {/* Filters Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#1b2127] border border-[#3b4754] p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl scale-100 transition-all">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-white">تصفية السجل</h3>
              <button onClick={() => setIsFilterModalOpen(false)} className="size-10 px-4 py-2 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">✕</button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[#1173d4] text-[10px] font-black uppercase tracking-widest px-1">نطاق الأسبوع</label>
                <select
                  className="w-full bg-[#101922] border border-[#3b4754] text-white rounded-2xl h-14 px-5 focus:ring-2 focus:ring-[#1173d4] outline-none transition-all cursor-pointer font-bold"
                  value={selectedWeek.format("YYYY-MM-DD")}
                  onChange={(e) => setSelectedWeek(dayjs(e.target.value))}
                >
                  {weeks.map((w, i) => (
                    <option key={i} value={w.start.format("YYYY-MM-DD")} className="bg-[#1b2127]">
                      {w.start.format("D MMM")} - {w.end.format("D MMM YYYY")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#9cabba] text-[10px] font-black uppercase tracking-widest px-1">نوع العملية</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-[#101922] border border-[#3b4754] text-white rounded-2xl h-14 px-5 focus:ring-2 focus:ring-[#1173d4] outline-none transition-all cursor-pointer font-bold"
                >
                  <option value="" className="bg-[#1b2127]">جميع الأنواع</option>
                  {Object.entries(typeLabels).map(([val, label]) => (
                    <option key={val} value={val} className="bg-[#1b2127]">{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#9cabba] text-[10px] font-black uppercase tracking-widest px-1">الجهة / الفرع</label>
                <select
                  value={partyFilter}
                  onChange={(e) => setPartyFilter(e.target.value)}
                  className="w-full bg-[#101922] border border-[#3b4754] text-white rounded-2xl h-14 px-5 focus:ring-2 focus:ring-[#1173d4] outline-none transition-all cursor-pointer font-bold"
                >
                  <option value="" className="bg-[#1b2127]">جميع الجهات</option>
                  {uniqueParties.map((p: any) => (
                    <option key={p} value={p} className="bg-[#1b2127]">{p}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-full bg-[#1173d4] hover:bg-[#1100f4] text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 mt-4"
              >
                تحديث النتائج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
