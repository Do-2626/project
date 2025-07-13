import React from "react";
import { IncomeStatementData } from "../types";
import KPICards from "@/components/KPICards";

interface IncomeStatementKPIsProps {
  data: IncomeStatementData;
}

export default function IncomeStatementKPIs({ data }: IncomeStatementKPIsProps) {
  const totalRevenue = data.revenues?.reduce((sum, r) => sum + r.amount, 0) || 0;
  const totalExpenses = data.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  
  const kpiData = [
    {
      title: "إجمالي الإيرادات",
      value: totalRevenue.toFixed(2),
      change: 0,
      currency: "ج.م"
    },
    {
      title: "إجمالي المصروفات",
      value: totalExpenses.toFixed(2),
      change: 0,
      currency: "ج.م"
    },
    {
      title: "صافي الربح",
      value: data.netProfit.toFixed(2),
      change: 0,
      currency: "ج.م"
    }
  ];

  return <KPICards data={kpiData as any} />;
}
