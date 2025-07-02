
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useToast } from "@/components/ui/use-toast";
import { Menu } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from '@/lib/utils';

// تعريف نوع الخصائص (Props) للمكون MainLayout
type MainLayoutProps = {
  children: React.ReactNode; // المحتوى الرئيسي الذي سيتم عرضه
  title?: string; // عنوان الصفحة (اختياري)
  dir?: "rtl" | "ltr"; // اتجاه الصفحة (يمين لليسار أو يسار لليمين)
};

// المكون الرئيسي لتخطيط الصفحة
export function MainLayout({ children, title = "نظام النور", dir = "rtl" }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // تبديل حالة الشريط الجانبي
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // إغلاق الشريط الجانبي
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    // العنصر الرئيسي للتخطيط
    <div className="flex h-screen bg-background" dir={dir}>
      {/* شريط الجانب - يظهر بشكل مختلف حسب حجم الشاشة */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isMobile={isMobile}
      />

      {/* الجزء الرئيسي من الصفحة */}
      <div className={cn(
        "flex-1 flex flex-col overflow-auto transition-all duration-300",
        !isMobile && sidebarOpen && "mr-64"
      )}>
        {/* رأس الصفحة */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex justify-between items-center px-6 py-3">
            {/* زر القائمة للأجهزة المحمولة */}
            <div className="flex items-center">
              {isMobile && (
                <button 
                  onClick={toggleSidebar} 
                  className="mr-3 p-2 rounded-full hover:bg-gray-100"
                  aria-label="Toggle menu"
                >
                  <Menu size={24} />
                </button>
              )}
              {/* عنوان الصفحة */}
              <h1 className="text-2xl font-semibold text-dairy-800">{title}</h1>
            </div>

            {/* قسم العناصر الجانبية في الرأس (مثل الملف الشخصي والإشعارات) */}
            <div className="flex items-center space-x-4">
              <div className="bg-dairy-100 text-dairy-800 px-3 py-1 rounded-full text-sm">
                مرحباً، المستخدم
              </div>
            </div>
          </div>
        </header>

        {/* المحتوى الرئيسي للصفحة */}
        <main className="p-6 flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* طبقة تظليل خلفية للأجهزة المحمولة عند فتح القائمة */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
