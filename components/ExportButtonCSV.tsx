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

    // Check if any key in the first data object contains "party"
    if (Object.keys(data[0]).some(key => key.includes("party"))) {
      data.forEach((item) => {
        if (item.productId?.name) {
          item["productName"] = item.productId.name;
        }
      });
    }

    // استخراج رؤوس الأعمدة من أول عنصر في البيانات
    const headers = Object.keys(data[0]);

    // تحويل البيانات إلى صفوف CSV
    const csvRows = [
      headers.join(","), // صف العناوين
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            const escaped = ("" + row[fieldName]).replace(/"/g, '""'); // الهروب من علامات الاقتباس
            return `"${escaped}"`; // إحاطة كل قيمة بعلامات اقتباس
          })
          .join(",")
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
