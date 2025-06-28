"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft } from "lucide-react";
import { CastData } from "@/lib/types"; // استيراد الـ interface من الملف الجديد
import { getCachedData, setCachedData, CACHE_KEY } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CastForm() {
  const [casts, setCasts] = useState<CastData[]>([]);
  const [searchedCasts, setSearchedCasts] = useState<CastData[]>([]);
  const [searchCastValue, setSearchCastValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // دالة جلب البيانات من الـ API
  const fetchCast = useCallback(async (useCache = true): Promise<void> => {
    if (useCache) {
      const cached = getCachedData<CastData[]>(CACHE_KEY);
      if (cached) {
        setCasts(cached);
        return;
      }
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cast");
      if (!response.ok) throw new Error("Failed to fetch casts");
      const data = await response.json();
      setCasts(data);
      setCachedData(CACHE_KEY, data);
    } catch (err) {
      setError("فشل في جلب البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // دالة البحث عن العميل
  const searchCast = useCallback(
    (search: string): void => {
      const filteredCasts =
        casts.filter((cast) => {
          return (
            String(cast.customerCode)
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            cast.name.toLowerCase().includes(search.toLowerCase()) ||
            cast.area.toLowerCase().includes(search.toLowerCase())
          );
        }) || [];
      setSearchedCasts(filteredCasts);
    },
    [casts]
  );

  // دالة إعادة تعيين البحث
  const resetSearch = useCallback((): void => {
    setSearchCastValue("");
    setSearchedCasts([]);
  }, []);

  // Initial load - check cache first
  useEffect(() => {
    fetchCast(true);
  }, [fetchCast]);

  // Manual refresh handler
  const handleRefresh = () => {
    // اختبار ما اذا كان يتوفر اتصال بالانترنت
    if (!navigator.onLine) {
      setError("لا يوجد اتصال بالإنترنت");
      return;
    }
    fetchCast(false); // Skip cache on manual refresh
  };

  // إدارة تغييرات البحث مع Debounce
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      searchCast(searchCastValue);
    }, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchCastValue, searchCast]);

  // دالة لتحويل البيانات إلى CSV
  function convertToCSV(data: CastData[]) {
    if (!data.length) return "";
    const keys = Object.keys(data[0]);
    const csvRows = [
      keys.join(","),
      ...data
        .map((row) =>
          keys
            .map((k) => `"${String(row[k as keyof CastData] ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
    ];
    return csvRows.join("\n");
  }

  // دالة لتحميل ملف CSV مع دعم BOM لظهور العربية بشكل صحيح
  function downloadCSV() {
    const dataToExport =
      searchedCasts.length > 0 || searchCastValue.length > 0
        ? searchedCasts
        : casts;
    const csv = convertToCSV(dataToExport);
    // إضافة BOM في بداية الملف
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="container mx-auto">
      {/* ناف بار ثانوية */}
      <div className="flex flex-col gap-4 my-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            قائمة العملاء
            {/* اظهار عدد النتائج */}
            <span className="text-sm text-muted-foreground">
              {searchedCasts.length > 0 || searchCastValue.length > 0
                ? `(${searchedCasts.length})`
                : `(${casts.length})`}
            </span>
            {/*  اظهار عدد النتائج الجارية */}
            <span className="text-sm text-muted-foreground">
              {` | `}
              {casts.filter((cast) => cast.status === "جارى").length > 0
                ? `(${
                    casts.filter((cast) => cast.status === "جارى").length
                  } جارى)`
                : ""}
            </span>
          </h1>
          <div className="flex gap-2">
            {/* زر تصدير العملاء إلى CSV */}
            <Button
              onClick={downloadCSV}
              variant="outline"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              تصدير CSV
            </Button>
            {/* زر تحديث */}
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
            {/* زر التصفية */}
            <Button
              onClick={resetSearch}
              variant="outline"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
              </svg>
            </Button>
            {/* زر اضافة عميل جديد */}
            <Link
              href="/cast/add"
              className="place-content-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* البحث عن العميل */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchCastValue}
            onChange={(e) => setSearchCastValue(e.target.value)}
            placeholder="ابحث عن الكود او الاسم او العنوان"
            className="px-4 py-2 border rounded-md focus:outline-none w-full focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
      </div>

      {/* عرض قائمة العملاء */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (searchedCasts.length > 0 || searchCastValue.length > 0
            ? searchedCasts
            : casts
          ).length === 0 ? (
          <div className="text-center text-muted-foreground">
            لا توجد بيانات لعرضها.
          </div>
        ) : (
          (searchedCasts.length > 0 || searchCastValue.length > 0
            ? searchedCasts
            : casts
          ).map((cast: CastData) => (
            <Link
              key={cast._id}
              href={{
                pathname: `/cast/${cast._id}`,
                query: { data: JSON.stringify(cast) }, // تمرير بيانات العميل كـ query parameter
              }}
              className={`group flex items-center justify-between p-4 rounded-lg border ${
                cast.status === "جارى" ? `bg-card` : `bg-red-200`
              } text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors`}
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{cast.name}</span>
                <span className="text-sm text-muted-foreground">
                  {cast.phone ? `${cast.phone}` : "رقم الهاتف غير متوفر"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {cast.area}
                  <br />
                  {cast.installmentCount - (cast.next - 1) >= 0
                    ? `باقى ${cast.installmentCount - (cast.next - 1)} قسط`
                    : ""}
                </span>
                <ChevronLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
