import { useState, useEffect } from "react";
import { IncomeStatementData } from "../types";

// Hook مخصص لإدارة بيانات قائمة الدخل
export default function useIncomeStatement() {
  // حالة لتحديد ما إذا كان المستخدم مصرح له
  const [isAuthorized, setIsAuthorized] = useState(false);
  // تاريخ البداية للنطاق الزمني
  const [startDate, setStartDate] = useState("");
  // تاريخ النهاية للنطاق الزمني
  const [endDate, setEndDate] = useState("");
  // بيانات قائمة الدخل الحالية
  const [statementData, setStatementData] = useState<IncomeStatementData | null>(null);
  // بيانات الفترة السابقة للمقارنة
  const [previousData, setPreviousData] = useState<IncomeStatementData | null>(null);
  // حالة التحميل
  const [loading, setLoading] = useState(true);
  // رسائل الخطأ
  const [error, setError] = useState("");

  // تهيئة التواريخ الافتراضية (الشهر الحالي)
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1); // أول يوم في الشهر
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); // آخر يوم في الشهر
    
    // تحويل التواريخ إلى صيغة YYYY-MM-DD
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(lastDay.toISOString().split("T")[0]);
  }, []);

  // التحقق من صحة التواريخ المدخلة
  const validateDates = () => {
    if (!startDate || !endDate) return "يرجى تحديد تاريخ البداية والنهاية";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    if (start > end) return "تاريخ البداية يجب أن يكون قبل تاريخ النهاية";
    if (end > today) return "لا يمكن اختيار تاريخ مستقبلي";
    
    return null; // لا يوجد أخطاء
  };

  // جلب بيانات قائمة الدخل من الخادم
  const fetchIncomeStatement = async () => {
    // التحقق من صحة التواريخ أولاً
    const validationError = validateDates();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // جلب بيانات الفترة الحالية
      const res = await fetch(`/api/finance/income-statement?startDate=${startDate}&endDate=${endDate}`);
      const currentData = await res.json();
      
      if (res.ok) {
        setStatementData(currentData);
        
        // حساب تواريخ الفترة السابقة للمقارنة
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = end.getTime() - start.getTime(); // الفارق الزمني بين التواريخ
        
        const prevEnd = new Date(start.getTime() - 86400000); // يوم واحد قبل تاريخ البداية
        const prevStart = new Date(prevEnd.getTime() - diff); // نفس المدة الزمنية للفترة السابقة
        
        // جلب بيانات الفترة السابقة
        const prevRes = await fetch(
          `/api/finance/income-statement?startDate=${prevStart.toISOString().split("T")[0]}&endDate=${prevEnd.toISOString().split("T")[0]}`
        );
        const previousPeriodData = await prevRes.json();
        
        if (prevRes.ok) {
          setPreviousData(previousPeriodData);
        }
      } else {
        setError(currentData.message || "حدث خطأ أثناء جلب البيانات");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات تلقائياً عند تغيير التواريخ أو صلاحية المستخدم
  useEffect(() => {
    if (isAuthorized) {
      fetchIncomeStatement();
    }
  }, [isAuthorized, startDate, endDate]);

  // تصدير القيم والوظائف للاستخدام في المكونات
  return {
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
  };
}