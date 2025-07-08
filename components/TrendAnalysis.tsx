'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

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

interface TrendAnalysisProps {
  data: IncomeStatementData;
  previousData?: IncomeStatementData | null;
}

export default function TrendAnalysis({ data, previousData }: TrendAnalysisProps) {
  // إذا لم تكن هناك بيانات سابقة، نعرض رسالة
  if (!previousData) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-bold mb-4 text-center text-white border-b border-gray-700 pb-2">
          تحليل الاتجاهات
        </h2>
        <p className="text-gray-300 text-center py-4">
          لا تتوفر بيانات سابقة للمقارنة. يرجى تحديد فترة زمنية سابقة للحصول على تحليل الاتجاهات.
        </p>
      </div>
    );
  }

  // حساب التغييرات في البيانات المالية
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, isIncrease: false, isZero: true };
    
    const change = current - previous;
    const percentage = (change / Math.abs(previous)) * 100;
    
    return {
      percentage: Math.abs(percentage),
      isIncrease: change > 0,
      isZero: change === 0
    };
  };

  // حساب التغييرات في المؤشرات الرئيسية
  const salesChange = calculateChange(data.sales, previousData.sales);
  const totalIncomeChange = calculateChange(data.totalIncome, previousData.totalIncome);
  const totalExpensesChange = calculateChange(data.totalExpenses, previousData.totalExpenses);
  const netProfitChange = calculateChange(data.netProfit, previousData.netProfit);

  // مكون لعرض التغيير مع سهم للاتجاه
  const ChangeIndicator = ({ change }: { change: { percentage: number, isIncrease: boolean, isZero: boolean } }) => {
    if (change.isZero) {
      return (
        <div className="flex items-center text-gray-400">
          <Minus className="h-4 w-4 mr-1" />
          <span>0%</span>
        </div>
      );
    }
    
    return (
      <div className={`flex items-center ${change.isIncrease ? 'text-green-400' : 'text-red-400'}`}>
        {change.isIncrease ? (
          <ArrowUp className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDown className="h-4 w-4 mr-1" />
        )}
        <span>{change.percentage.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold mb-4 text-center text-white border-b border-gray-700 pb-2">
        تحليل الاتجاهات
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-white">مقارنة الإيرادات</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">المبيعات</span>
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-white font-medium">{data.sales.toFixed(2)}</span>
                <ChangeIndicator change={salesChange} />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">إجمالي الإيرادات</span>
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-white font-medium">{data.totalIncome.toFixed(2)}</span>
                <ChangeIndicator change={totalIncomeChange} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-white">مقارنة المصروفات والأرباح</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">إجمالي المصروفات</span>
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-white font-medium">{data.totalExpenses.toFixed(2)}</span>
                <ChangeIndicator change={totalExpensesChange} />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">صافي الربح</span>
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className={`font-medium ${data.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {data.netProfit.toFixed(2)}
                </span>
                <ChangeIndicator change={netProfitChange} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-white">ملخص التحليل</h3>
        <p className="text-gray-300">
          {netProfitChange.isIncrease 
            ? `تحسن الأداء المالي بنسبة ${netProfitChange.percentage.toFixed(1)}% مقارنة بالفترة السابقة.` 
            : netProfitChange.isZero 
              ? 'لم يتغير الأداء المالي مقارنة بالفترة السابقة.'
              : `انخفض الأداء المالي بنسبة ${netProfitChange.percentage.toFixed(1)}% مقارنة بالفترة السابقة.`
          }
          {totalIncomeChange.isIncrease && totalExpensesChange.isIncrease 
            ? ' زادت الإيرادات والمصروفات معًا.'
            : totalIncomeChange.isIncrease 
              ? ' زادت الإيرادات مع استقرار أو انخفاض في المصروفات.'
              : totalExpensesChange.isIncrease 
                ? ' زادت المصروفات مع استقرار أو انخفاض في الإيرادات.'
                : ' انخفضت الإيرادات والمصروفات معًا.'
          }
        </p>
      </div>
    </div>
  );
}