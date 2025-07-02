
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 خطأ: حاول المستخدم الوصول إلى مسار غير موجود:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">عفواً! الصفحة غير موجودة</p>
        <Link to="/dashboard" className="text-blue-500 hover:text-blue-700 underline">
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
