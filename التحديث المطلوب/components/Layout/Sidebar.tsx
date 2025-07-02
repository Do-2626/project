
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
// استيراد أيقونات من مكتبة lucide-react
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  RotateCcw,
  BookOpen,
  Settings,
  LogOut,
  ArrowLeftCircle,
  ArrowRightCircle,
  UserCheck,
  X,
  CreditCard
} from 'lucide-react';

// تعريف نوع الخصائص للمكون
type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
};

// تعريف نوع عنصر القائمة الجانبية
type SidebarItem = {
  name: string;       // نص العنصر
  href: string;       // الرابط
  icon: React.ElementType; // الأيقونة
};

// مصفوفة عناصر القائمة الجانبية
const sidebarItems: SidebarItem[] = [
  { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
  { name: 'المخزون', href: '/inventory', icon: Package },
  { name: 'المناديب', href: '/delegates', icon: UserCheck },
  { name: 'الفواتير', href: '/invoices', icon: FileText },
  { name: 'العملاء', href: '/clients', icon: Users },
  { name: 'المرتجعات', href: '/returns', icon: RotateCcw },
  { name: 'المحاسبة', href: '/accounting', icon: BookOpen },
  { name: 'النقدية', href: '/cash', icon: CreditCard },
  { name: 'الإعدادات', href: '/settings', icon: Settings },
];

// مكون الشريط الجانبي
export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const { signOut } = useAuth();
  const { toast } = useToast();
  // حالة طي/إظهار الشريط الجانبي للأجهزة المكتبية
  const [collapsed, setCollapsed] = useState(true);
  // حالة تتبع تحويم الماوس فوق الشريط الجانبي
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  // إعادة تعيين حالة القائمة عند تغيير حجم الشاشة
  useEffect(() => {
    if (!isMobile) {
      onClose();
    }
  }, [isMobile, onClose]);

  // معالجة النقر على عنصر في القائمة
  const handleItemClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  // معالجة دخول الماوس للشريط الجانبي
  const handleMouseEnter = () => {
    if (!isMobile && collapsed) {
      setIsHovered(true);
    }
  };

  // معالجة خروج الماوس من الشريط الجانبي
  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
    }
  };

  return (
    <>
      {/* شريط جانبي للأجهزة المكتبية */}
      {!isMobile && (
        <div
          className={cn(
            "h-screen bg-sidebar flex flex-col text-sidebar-foreground transition-all duration-300 z-10",
            collapsed && !isHovered ? "w-[50px] md:w-16" : "w-64" // تغيير العرض حسب حالة الطي أو التحويم
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* رأس الشريط الجانبي */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {/* إظهار اسم النظام فقط عندما يكون الشريط مفتوحاً أو عند التحويم */}
            {(!collapsed || isHovered) && (
              <div className="text-xl font-bold text-white">النور</div>
            )}
            {/* زر طي/إظهار الشريط */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {collapsed && !isHovered ? <ArrowLeftCircle size={20} /> : <ArrowRightCircle size={20} />}
            </button>
          </div>

          {/* قائمة التنقل الرئيسية */}
          <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <li key={item.name}>
                    {/* رابط عنصر القائمة */}
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors whitespace-nowrap",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                      onClick={handleItemClick}
                    >
                      {/* أيقونة العنصر */}
                      <item.icon className="h-5 w-5 mr-1 flex-shrink-0" />
                      {/* نص العنصر (يظهر فقط عندما يكون الشريط مفتوحاً أو عند التحويم) */}
                      {(!collapsed || isHovered) && <span className="mr-3 whitespace-nowrap overflow-hidden transition-all duration-300">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* قسم تسجيل الخروج في أسفل الشريط */}
          <div className="p-4 border-t border-sidebar-border">
            <button
              className="flex items-center py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg w-full whitespace-nowrap overflow-hidden transition-all duration-300"
              onClick={async () => {
                const confirmed = window.confirm('هل أنت متأكد أنك تريد تسجيل الخروج؟');

                if (confirmed) {
                  try {
                    await signOut();
                  } catch (error) {
                    toast({
                      title: 'خطأ في تسجيل الخروج',
                      description: 'حدث خطأ أثناء محاولة تسجيل الخروج. يرجى المحاولة مرة أخرى.',
                      variant: 'destructive',
                    });
                  }
                }
              }}
            >
              <LogOut className={`h-5 w-5 flex-shrink-0 ${collapsed && !isHovered ? "m-auto" : "ml-3"}`} />
              {/* نص تسجيل الخروج (يظهر فقط عندما يكون الشريط مفتوحاً أو عند التحويم) */}
              {(!collapsed || isHovered) && <span className="whitespace-nowrap overflow-hidden transition-all duration-300">تسجيل الخروج</span>}
            </button>
          </div>
        </div>
      )}

      {/* قائمة منسدلة للأجهزة المحمولة */}
      {isMobile && (
        <div className={cn(
          "fixed inset-y-0 right-0 z-30 w-64 bg-sidebar flex flex-col text-sidebar-foreground shadow-lg transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}>
          {/* رأس القائمة المنسدلة */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="text-xl font-bold text-white">النور</div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="إغلاق القائمة"
            >
              <X size={20} />
            </button>
          </div>

          {/* قائمة التنقل المنسدلة */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                      onClick={handleItemClick}
                    >
                      <item.icon className="h-5 w-5 ml-3" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* قسم تسجيل الخروج */}
          <div className="p-4 border-t border-sidebar-border">
            <button
              className="flex items-center px-4 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg w-full"
              onClick={async () => {
                const confirmed = window.confirm('هل أنت متأكد أنك تريد تسجيل الخروج؟');

                if (confirmed) {
                  try {
                    await signOut();
                  } catch (error) {
                    toast({
                      title: 'خطأ في تسجيل الخروج',
                      description: 'حدث خطأ أثناء محاولة تسجيل الخروج. يرجى المحاولة مرة أخرى.',
                      variant: 'destructive',
                    });
                  }
                }
              }}
            >
              <LogOut className="h-5 w-5 ml-3" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
