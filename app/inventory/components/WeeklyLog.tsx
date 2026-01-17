"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import ExportButtonCSV from "@/components/ExportButtonCSV";
import PasswordPrompt from "@/components/PasswordPrompt";

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
  const [selectedWeek, setSelectedWeek] = useState(currentSaturday); // Default to this week (Saturday start)
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProtected, setShowProtected] = useState(false);


  // Generate last 12 weeks for the filter
  const weeks = Array.from({ length: 12 }).map((_, i) => {
    // To get the most recent Saturday:
    // If today is Saturday (6), start is today.
    // If today is Sunday (0), start is yesterday, and so on.
    const start = currentSaturday.subtract(i, "week");
    const end = start.add(6, "day");
    return { start, end };
  });

  useEffect(() => {
    const fetchWeeklyTransactions = async () => {
      setIsLoading(true);
      const startStr = selectedWeek.format("YYYY-MM-DD");
      const endStr = selectedWeek.add(6, "day").format("YYYY-MM-DD");

      try {
        // We need an API that supports date range. 
        // Checking if /api/transactions supports range. If not, we'll fetch all and filter or assume it might need range support.
        // Based on previous analysis, it might only support single date.
        // Let's try fetching with range params.
        // Fetching from the new weekly-report API that joins inventory and expenses
        const res = await fetch(`/api/inventory/weekly-report?startDate=${startStr}&endDate=${endStr}`);
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch weekly transactions", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyTransactions();
  }, [selectedWeek]);

  const groupedTransactions = transactions.reduce((acc: any, t: any) => {
    const date = t.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => dayjs(a).isBefore(dayjs(b)) ? -1 : 1);

  return (
    <div className="bg-gray-700 p-4 rounded-lg mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-600 pb-4">
        <div>
          <h3 className="text-xl font-bold text-blue-400">سجل عمليات الأسبوع</h3>
          <p className="text-gray-400 text-sm mt-1">عرض العمليات حسب الأسبوع (يبدأ من السبت)</p>
        </div>


        {showProtected && (
          <div className="flex items-center gap-3">
            <label className="text-gray-300">اختر الأسبوع:</label>
            <select
              className="bg-gray-800 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={selectedWeek.format("YYYY-MM-DD")}
              onChange={(e) => setSelectedWeek(dayjs(e.target.value))}
            >
              {weeks.map((w, i) => (
                <option key={i} value={w.start.format("YYYY-MM-DD")}>
                  {w.start.format("YYYY/MM/DD")} - {w.end.format("YYYY/MM/DD")}
                </option>
              ))}
            </select>

            <ExportButtonCSV
              data={transactions}
              fileName={`weekly-log-${selectedWeek.format("YYYY-MM-DD")}`}
              label="تصدير الأسبوع"
            />
          </div>)}
      </div>
      {!showProtected ? (
        <div className="mb-4">
          <PasswordPrompt
            onSuccess={() => setShowProtected(true)}
            label="كلمة المرور لعرض التقارير المالية"
            buttonText="تأكيد"
          />
        </div>
      ) : ("")}

      {showProtected && isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">جاري تحميل البيانات...</p>
        </div>
      ) : showProtected && transactions.length === 0 ? (
        <div className="text-center py-10 text-gray-500 italic">
          لا توجد عمليات مسجلة في هذا الأسبوع.
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700">
              <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                <span className="text-blue-300 font-bold">
                  {dayjs(date).format("dddd")} - {date}
                </span>
                <span className="text-gray-500 text-xs">
                  {groupedTransactions[date].length} عملية
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="p-3 text-right">النوع</th>
                    <th className="p-3 text-right">الصنف</th>
                    <th className="p-3 text-right">الكمية</th>
                    <th className="p-3 text-right">المبلغ</th>
                    <th className="p-3 text-right">الجهة</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedTransactions[date].map((t: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-750 border-b border-gray-700 last:border-0 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {iconMap && iconMap[t.type]}
                          <span>{typeLabels[t.type]}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {t.isFinancial ? (
                          <div className="flex flex-col">
                            <span className="text-blue-300 font-bold">
                              {t.expenseCategoryId?.name || t.category || "مصروف"}
                              {t.expenseSubtype && ` - ${t.expenseSubtype}`}
                            </span>
                            {t.description && (
                              <span className="text-xs text-gray-400 italic">
                                {t.description}
                              </span>
                            )}
                          </div>
                        ) : (
                          t.productId?.name || ""
                        )}
                      </td>
                      <td className="p-3 text-gray-200 font-mono">
                        {t.isFinancial ? "-" : t.quantity}
                      </td>
                      <td className="p-3 text-green-400 font-bold">
                        {t.amount ? `${t.amount.toLocaleString()} د.ل` : "-"}
                      </td>
                      <td className="p-3">
                        {t.branchId?.name ? (
                          <span className="bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded text-xs border border-blue-800">
                            {t.branchId.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">{t.party || "-"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}
