"use client";

import React from "react";
import PasswordPrompt from "@/components/PasswordPrompt";
import IncomeStatementChart from "./components/IncomeStatementChart";
import IncomeStatementTable from "./components/IncomeStatementTable";
import DateRangeSelector from "./components/DateRangeSelector";
import IncomeStatementKPIs from "./components/IncomeStatementKPIs";
import ComparativeAnalysis from "./components/ComparativeAnalysis";
import useIncomeStatement from "./hooks/useIncomeStatement";
import { IncomeStatementData } from "./types";
import { revenueCategories, expenseCategories } from "./utils/constants";

export default function IncomeStatementPage() {
  const {
    isAuthorized,
    setIsAuthorized,
    statementData,
    previousData,
    loading,
    error,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    fetchIncomeStatement
  } = useIncomeStatement();

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-white mb-8">
            قائمة الدخل
          </h1>
          <PasswordPrompt
            onSuccess={() => setIsAuthorized(true)}
            label="أدخل كلمة المرور للوصول إلى قائمة الدخل"
            buttonText="تأكيد"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 drop-shadow-lg tracking-wide font-cairo">
            قائمة الدخل
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium font-cairo">
            تحليل الإيرادات والمصروفات والأرباح
          </p>
        </header>

        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onRefresh={fetchIncomeStatement}
          loading={loading}
        />

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400">جاري تحميل البيانات...</div>
        ) : statementData ? (
          <>
            <IncomeStatementKPIs data={statementData} />
            <ComparativeAnalysis 
              currentData={statementData} 
              previousData={previousData} 
            />
            <IncomeStatementTable data={statementData} />
            <IncomeStatementChart data={statementData} />
          </>
        ) : (
          <div className="text-center text-gray-400 py-8">
            لا توجد بيانات متاحة للفترة المحددة
          </div>
        )}
      </div>
    </div>
  );
}
