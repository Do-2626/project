// app/finance/income-statement/components/TrendAnalysis.tsx
'use client'; // هذا يحدد أن المكون يعمل على جانب العميل (Client Component)

import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'; // أيقونات للاتجاهات
// استيراد واجهة TrendItem من ملف الأنواع المشترك
// تأكد أن هذا المسار صحيح بناءً على هيكلة مشروعك
import { TrendItem } from "../types"; 

// واجهة خصائص المكون TrendAnalysis
// يتوقع مصفوفة من كائنات TrendItem
interface TrendAnalysisProps {
  data: TrendItem[]; 
}

export default function TrendAnalysis({ data }: TrendAnalysisProps) {
  // التحقق من أن هناك بيانات لتجنب الأخطاء وعرض رسالة مناسبة
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-white">
        <h2 className="text-xl font-bold mb-4 text-center border-b border-gray-700 pb-2">
          تحليل الاتجاهات
        </h2>
        <p className="text-gray-300 text-center py-4">
          لا تتوفر بيانات كافية لإجراء تحليل الاتجاهات.
        </p>
      </div>
    );
  }

  /**
   * دالة مساعدة لحساب التغيير النسبي بين قيمتين.
   * تتعامل مع حالة القسمة على صفر (القيمة السابقة كانت صفرًا).
   * @param current - القيمة الحالية.
   * @param previous - القيمة السابقة.
   * @returns كائن يحتوي على النسبة المئوية للتغيير، والاتجاه (زيادة/نقصان)، وما إذا كان التغيير صفرًا.
   */
  const calculateChange = (current: number, previous: number) => {
    // معالجة خاصة للتحول من صفر إلى رقم (زيادة/نقصان لا نهائي)
    if (previous === 0) {
      if (current > 0) return { percentage: Infinity, isIncrease: true, isZero: false }; 
      if (current < 0) return { percentage: Infinity, isIncrease: false, isZero: false };
      return { percentage: 0, isIncrease: false, isZero: true }; // صفر إلى صفر
    }
    
    const change = current - previous;
    const percentage = (change / previous) * 100; // النسبة المئوية للتغير
    
    return {
      percentage: Math.abs(percentage), // دائمًا قيمة موجبة للعرض
      isIncrease: percentage > 0, // الاتجاه (زيادة/نقصان)
      isZero: percentage === 0
    };
  };

  /**
   * مكون فرعي (مساعد) لعرض مؤشر التغيير (سهم للأعلى/للأسفل أو خط أفقي).
   * يعرض النسبة المئوية للتغيير مع اللون المناسب.
   * @param change - كائن يحتوي على تفاصيل التغيير (ناتج calculateChange).
   */
  const ChangeIndicator = ({ change }: { change: ReturnType<typeof calculateChange> }) => {
    if (change.isZero) {
      return (
        <div className="flex items-center text-gray-400">
          <Minus className="h-4 w-4 mr-1" />
          <span>0%</span>
        </div>
      );
    }
    
    // التعامل مع الزيادة/النقصان اللانهائي
    if (change.percentage === Infinity) { 
      return (
        <div className={`flex items-center ${change.isIncrease ? 'text-green-400' : 'text-red-400'}`}>
          {change.isIncrease ? (
            <ArrowUp className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 mr-1" />
          )}
          <span>∞%</span> {/* رمز اللانهاية */}
        </div>
      );
    }

    // العرض الافتراضي للنسبة المئوية
    return (
      <div className={`flex items-center ${change.isIncrease ? 'text-green-400' : 'text-red-400'}`}>
        {change.isIncrease ? (
          <ArrowUp className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDown className="h-4 w-4 mr-1" />
        )}
        <span>{change.percentage.toFixed(1)}%</span> {/* عرض النسبة المئوية بكسر عشري واحد */}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold mb-4 text-center text-white border-b border-gray-700 pb-2">
        تحليل الاتجاهات
      </h2>
      
      {/* شبكة لعرض البنود المالية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-white">تفاصيل التحليل</h3>
          
          <div className="space-y-4">
            {/* استخدام دالة map للمرور على كل عنصر TrendItem في مصفوفة data وعرضه ديناميكيًا */}
            {data.map((item, index) => { 
              const change = calculateChange(item.current, item.previous);
              return (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-300">{item.label}</span> {/* اسم البند */}
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <span className="text-white font-medium">
                      {item.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span> {/* القيمة الحالية منسقة */}
                    <ChangeIndicator change={change} /> {/* مؤشر التغيير */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/*
          تم إزالة الأقسام الثابتة الأخرى (مثل "مقارنة الإيرادات" و "مقارنة المصروفات والأرباح")
          لأن الكومبوننت أصبح الآن ديناميكيًا بالكامل ويعرض أي بيانات يتم تمريرها إليه عبر مصفوفة 'data'.
          إذا أردت إضافة أقسام إضافية أو ملخص تحليل، يجب أن يتم ذلك بشكل ديناميكي أيضًا
          أو يتم نقله إلى كومبوننت أب أعلى يقوم بتجميع هذه المعلومات.
        */}
      </div>
    </div>
  );
}