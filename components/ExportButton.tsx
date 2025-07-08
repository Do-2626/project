'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  data: any;
  fileName: string;
  label: string;
}

export default function ExportButton({ data, fileName, label }: ExportButtonProps) {
  const handleExport = () => {
    // تحويل البيانات إلى نص JSON
    const jsonString = JSON.stringify(data, null, 2);
    
    // إنشاء Blob من النص
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // إنشاء URL للتنزيل
    const url = URL.createObjectURL(blob);
    
    // إنشاء عنصر رابط وهمي للتنزيل
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    
    // إضافة الرابط إلى المستند والنقر عليه ثم إزالته
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // تحرير URL
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