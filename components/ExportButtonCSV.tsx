"use client";

import React from "react";
import { Download } from "lucide-react";

interface ExportButtonProps {
  data: any[];
  fileName: string;
  label: string;
}

export default function ExportButtonCSV({
  data,
  fileName,
  label,
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data || !data.length) return;

    const typeLabels: Record<string, string> = {
      purchase: "مشتريات",
      outgoing: "تحميل",
      incoming: "مرتجع",
      damaged: "تالف",
      sale: "بيع",
    };

    // تجهيز البيانات بشكل منظم للأعمدة
    const processedData = data.map((item) => {
      // إذا كانت المعاملة تحتوي على منتج، نستخرج اسمه
      const productName = item.productId?.name || item.productName || "";
      const branchName = item.branchId?.name || item.party || "-";
      const typeLabel = typeLabels[item.type] || item.type || "";

      return {
        "التاريخ": item.date || "",
        "النوع": typeLabel,
        "الصنف": productName,
        "الكمية": item.quantity || 0,
        "الجهة/الفرع": branchName,
        "المبلغ": item.amount || 0,
      };
    });

    // استخراج رؤوس الأعمدة باللغة العربية
    const headers = Object.keys(processedData[0]);

    // تحويل البيانات إلى صفوف CSV باستخدام الفاصلة المنقوطة لتوافق أفضل مع Excel
    const delimiter = ";";
    const csvRows = [
      headers.join(delimiter), // صف العناوين
      ...processedData.map((row: any) =>
        headers
          .map((fieldName) => {
            const value = row[fieldName] === undefined || row[fieldName] === null ? "" : row[fieldName];
            const escaped = ("" + value).replace(/"/g, '""'); // الهروب من علامات الاقتباس
            return `"${escaped}"`; // إحاطة كل قيمة بعلامات اقتباس
          })
          .join(delimiter)
      ),
    ];

    // دمج الصفوف مع الفواصل الجديدة
    const csvString = csvRows.join("\n");

    // إنشاء Blob بنوع نص CSV
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvString], {
      type: "text/csv;charset=utf-8;",
    });
    // const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // إنشاء URL للتنزيل
    const url = URL.createObjectURL(blob);

    // إنشاء رابط وهمي
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
    >
      <Download size={16} />
      {label}
    </button>
  );
}
