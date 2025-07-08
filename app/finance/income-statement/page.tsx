'use client';

import React, { useState, useEffect } from 'react';
import Calendar from '../../../components/Calendar';
import PasswordPrompt from '../../../components/PasswordPrompt';
import IncomeStatementTable from '../../../components/IncomeStatementTable';
import IncomeStatementChart from '../../../components/IncomeStatementChart';
import ExportButton from '../../../components/ExportButton';
import KPICards from '../../../components/KPICards';
import TrendAnalysis from '../../../components/TrendAnalysis';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function IncomeStatement() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

  const [incomeData, setIncomeData] = useState<IncomeStatementData | null>(null);
  const [previousData, setPreviousData] = useState<IncomeStatementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // تعيين التاريخ الافتراضي (الشهر الحالي)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchIncomeStatement = async () => {
    if (!startDate || !endDate) {
      setError('يرجى تحديد نطاق التاريخ');
      return;
    }
    
    // التحقق من أن تاريخ البداية يسبق تاريخ النهاية
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (startDateObj > endDateObj) {
      setError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
      return;
    }
    
    // التحقق من أن التاريخ ليس في المستقبل
    const today = new Date();
    today.setHours(23, 59, 59, 999); // نهاية اليوم الحالي
    
    if (endDateObj > today) {
      setError('لا يمكن عرض بيانات لتاريخ في المستقبل. يرجى اختيار تاريخ حالي أو سابق.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // جلب البيانات الحالية
      const res = await fetch(`/api/finance/income-statement?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      
      if (res.ok) {
        setIncomeData(data);
        // إعادة تعيين أي رسائل خطأ سابقة
        setError('');
        
        // حساب الفترة السابقة المماثلة (نفس المدة)
        const currentStartDate = new Date(startDate);
        const currentEndDate = new Date(endDate);
        const dateDiff = currentEndDate.getTime() - currentStartDate.getTime();
        
        const previousEndDate = new Date(currentStartDate.getTime() - 1); // يوم قبل بداية الفترة الحالية
        const previousStartDate = new Date(previousEndDate.getTime() - dateDiff);
        
        // تنسيق التواريخ إلى YYYY-MM-DD
        const formattedPrevStartDate = previousStartDate.toISOString().split('T')[0];
        const formattedPrevEndDate = previousEndDate.toISOString().split('T')[0];
        
        // جلب بيانات الفترة السابقة
        const prevRes = await fetch(`/api/finance/income-statement?startDate=${formattedPrevStartDate}&endDate=${formattedPrevEndDate}`);
        const prevData = await prevRes.json();
        
        if (prevRes.ok) {
          setPreviousData(prevData);
        } else {
          console.warn('تعذر جلب بيانات الفترة السابقة:', prevData.message);
          setPreviousData(null);
        }
      } else {
        setError(data.message || 'حدث خطأ أثناء جلب البيانات');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized && startDate && endDate) {
      fetchIncomeStatement();
    }
  }, [isAuthorized, startDate, endDate]);

  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">قائمة الدخل</h1>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <PasswordPrompt 
            onSuccess={() => setIsAuthorized(true)} 
            label="أدخل كلمة المرور للوصول إلى قائمة الدخل" 
            buttonText="عرض قائمة الدخل"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">قائمة الدخل</h1>
        <div className="flex gap-2">
          {incomeData && (
            <ExportButton 
              data={incomeData} 
              fileName={`income-statement-${startDate}-to-${endDate}`} 
              label="تصدير البيانات" 
            />
          )}
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition">
            العودة للرئيسية
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 mb-2">من تاريخ</label>
            <Calendar selectedDate={startDate} onChange={setStartDate} />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">إلى تاريخ</label>
            <Calendar selectedDate={endDate} onChange={setEndDate} />
          </div>
          <div className="flex items-end">
            <button 
              onClick={fetchIncomeStatement}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition w-full"
            >
              {loading ? 'جاري التحميل...' : 'تحديث البيانات'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {incomeData && (
        <>
          {(incomeData?.totalIncome === 0 && incomeData?.totalExpenses === 0) ? (
            <div className="bg-yellow-600 bg-opacity-30 text-white p-4 rounded-lg mb-6 text-center">
              <p className="text-lg">لا توجد بيانات مالية في الفترة المحددة</p>
              <p className="text-sm mt-2">يرجى تحديد فترة زمنية أخرى أو التأكد من وجود معاملات مسجلة</p>
            </div>
          ) : (
            <>
              <KPICards data={incomeData} />
              <TrendAnalysis data={incomeData} previousData={previousData} />
              <IncomeStatementTable data={incomeData} />
              <div className="mt-6">
                <IncomeStatementChart data={incomeData} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}