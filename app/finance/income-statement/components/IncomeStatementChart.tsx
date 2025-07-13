import React from "react";
import { IncomeStatementData } from "../types";

interface IncomeStatementChartProps {
  data: IncomeStatementData;
}

export default function IncomeStatementChart({ data }: IncomeStatementChartProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-xl font-semibold mb-4 text-white">الرسم البياني لقائمة الدخل</h2>
      <div className="text-gray-400">سيتم إضافة الرسم البياني هنا لاحقاً</div>
    </div>
  );
}
