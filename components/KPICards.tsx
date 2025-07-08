'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';

interface IncomeStatementData {
  startDate: string;
  endDate: string;
  sales: number;
  otherIncome: number;
  totalIncome: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  otherExpenses: number;
  totalExpenses: number;
  netProfit: number;
}

interface KPICardsProps {
  data: IncomeStatementData;
}

export default function KPICards({ data }: KPICardsProps) {
  // حساب هامش الربح الإجمالي
  const grossProfit = data.sales - data.costOfGoodsSold;
  const grossProfitMargin = data.sales > 0 ? (grossProfit / data.sales) * 100 : 0;
  
  // حساب هامش صافي الربح
  const netProfitMargin = data.totalIncome > 0 ? (data.netProfit / data.totalIncome) * 100 : 0;
  
  // حساب نسبة المصروفات التشغيلية
  const operatingExpenseRatio = data.totalIncome > 0 ? (data.operatingExpenses / data.totalIncome) * 100 : 0;
  
  // حساب نسبة تكلفة البضاعة المباعة
  const cogsRatio = data.sales > 0 ? (data.costOfGoodsSold / data.sales) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* بطاقة هامش الربح الإجمالي */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-blue-100">هامش الربح الإجمالي</h3>
            <p className="text-2xl font-bold text-white mt-1">{grossProfitMargin.toFixed(1)}%</p>
          </div>
          <div className="p-2 bg-blue-500 bg-opacity-40 rounded-full">
            <BarChart2 className="h-6 w-6 text-blue-100" />
          </div>
        </div>
        <div className="mt-2 text-sm text-blue-100">
          <span className="font-medium">{grossProfit.toFixed(2)}</span> من إجمالي المبيعات
        </div>
      </div>

      {/* بطاقة هامش صافي الربح */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-green-100">هامش صافي الربح</h3>
            <p className="text-2xl font-bold text-white mt-1">{netProfitMargin.toFixed(1)}%</p>
          </div>
          <div className="p-2 bg-green-500 bg-opacity-40 rounded-full">
            {netProfitMargin >= 0 ? (
              <TrendingUp className="h-6 w-6 text-green-100" />
            ) : (
              <TrendingDown className="h-6 w-6 text-green-100" />
            )}
          </div>
        </div>
        <div className="mt-2 text-sm text-green-100">
          <span className="font-medium">{data.netProfit.toFixed(2)}</span> من إجمالي الإيرادات
        </div>
      </div>

      {/* بطاقة نسبة المصروفات التشغيلية */}
      <div className="bg-gradient-to-br from-red-600 to-red-800 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-red-100">نسبة المصروفات التشغيلية</h3>
            <p className="text-2xl font-bold text-white mt-1">{operatingExpenseRatio.toFixed(1)}%</p>
          </div>
          <div className="p-2 bg-red-500 bg-opacity-40 rounded-full">
            <DollarSign className="h-6 w-6 text-red-100" />
          </div>
        </div>
        <div className="mt-2 text-sm text-red-100">
          <span className="font-medium">{data.operatingExpenses.toFixed(2)}</span> من إجمالي الإيرادات
        </div>
      </div>

      {/* بطاقة نسبة تكلفة البضاعة المباعة */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-purple-100">نسبة تكلفة البضاعة المباعة</h3>
            <p className="text-2xl font-bold text-white mt-1">{cogsRatio.toFixed(1)}%</p>
          </div>
          <div className="p-2 bg-purple-500 bg-opacity-40 rounded-full">
            <BarChart2 className="h-6 w-6 text-purple-100" />
          </div>
        </div>
        <div className="mt-2 text-sm text-purple-100">
          <span className="font-medium">{data.costOfGoodsSold.toFixed(2)}</span> من إجمالي المبيعات
        </div>
      </div>
    </div>
  );
}