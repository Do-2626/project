import React from "react";
import { IncomeStatementData, TrendItem } from "../types";

// import TrendAnalysis from "@/app/finance/income-statement/components/TrendAnalysis";
import TrendAnalysis from "./TrendAnalysis";

interface ComparativeAnalysisProps {
  currentData: IncomeStatementData;
  previousData: IncomeStatementData | null;
}

export default function ComparativeAnalysis({
  currentData,
  previousData,
}: ComparativeAnalysisProps) {
  if (!previousData) return null;

  const currentProfit = currentData.netProfit;
  const previousProfit = previousData.netProfit;
  const profitChange =
    previousProfit !== 0
      ? ((currentProfit - previousProfit) / previousProfit) * 100
      : 0;

  const analysisData = [
    {
      label: "المبيعات",
      current: currentData?.sales || 0,
      previous: previousData?.sales || 0,
    },
    {
      label: "الإيرادات الأخرى",
      current: currentData?.otherIncome || 0,
      previous: previousData?.otherIncome || 0,
    },
    {
      label: "المصروفات التشغيلية",
      current: currentData?.operatingExpenses || 0,
      previous: previousData?.operatingExpenses || 0,
    },
    {
      label: "صافي الربح",
      current: currentProfit,
      previous: previousProfit,
    },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-xl font-semibold mb-4 text-white">تحليل مقارن</h2>
      <TrendAnalysis data={analysisData} />
    </div>
  );
}
