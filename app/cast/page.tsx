"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";

interface CastData {
  _id: string;
  customerCode: string;
  monthDate: string;
  date: string;
  name: string;
  phone: string;
  k: number;
  t: number;
  otherProducts: string;
  advance: number;
  amount: number;
  installments: number;
  product: string;
  area: string;
  notes: string;
  collectedInstallmentNumber: number;
  printStatus: string;
  upcomingCollectionAmount: number;
  nextInstallment: number;
  piecePrice: number;
  status: string;
  column2: number;
  delayInMonths: number;
  paidFromNextInstallment: string;
}

export default function CastForm() {
  const [casts, setCasts] = useState<CastData[]>([]);
  const [searchedCasts, setSearchedCasts] = useState<CastData[]>([]);
  const [searchCastValue, setSearchCastValue] = useState<string>("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCast();
  }, []);

  //  دالة البحث عن العميل من خلال او الكود المنطقة او الاسم
  const searchCast = (search: string) => {
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
  };

  async function fetchCast() {
    try {
      const response = await fetch("/api/cast");
      if (!response.ok) {
        throw new Error("Failed to fetch casts");
      }
      const data = await response.json();
      setCasts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch casts:", error);
      setCasts([]); // Ensure casts is always an array
    }
  }
  return (
    <div className="container mx-auto">
      {/* ناف بار ثانوية */}
      <div className="flex flex-col gap-4 my-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">قائمة العملاء</h1>

          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchCast();
                setSearchCastValue("");
                setSearchedCasts([]);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              {" "}
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
            </button>
            <Link
              href="/cast/add"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* البحث عن العميل من خلال المنطقة او الاسم */}
        <div className="flex gap-2 ">
          <input
            type="text"
            value={searchCastValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchCastValue(value);
              if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
              }
              debounceTimeout.current = setTimeout(() => {
                searchCast(value);
              }, 500);
            }}
            placeholder={"ابحث عن الكود او الاسم او العنوان"}
            className="px-4 py-2 border rounded-md focus:outline-none w-full focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
      </div>

      {/* التصفية */}
      <div className="flex gap-4">
        {/* التصفية حسب العنوان من قائمة منسدلة */}
        <div className="flex justify-end gap-4 mb-8">
          <select
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            // onChange={(e) => {
            //   const selectedArea = e.target.value;
            //   if (selectedArea === "all") {
            //     setSearchedCasts([]);
            //   } else {
            //     const filteredCasts = casts.filter((cast) =>
            //       cast.area.toLowerCase().includes(selectedArea.toLowerCase())
            //     );
            //     setSearchedCasts(filteredCasts);
            //   }
            // }}
          >
            <option value="all">الكل</option>
            <option value="المنصورة">المنصورة</option>
            <option value="المناخ">المناخ</option>
            <option value="المناخ الجديد">المناخ الجديد</option>
          </select>
        </div>

        {/* التصفية حسب التحصيل من قائمة منسدلة */}
        <div className="flex justify-end gap-4 mb-8">
          <select
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            // onChange={(e) => {
            //   const selectedArea = e.target.value;
            //   if (selectedArea === "all") {
            //     setSearchedCasts([]);
            //   } else {
            //     const filteredCasts = casts.filter((cast) =>
            //       cast.area.toLowerCase().includes(selectedArea.toLowerCase())
            //     );
            //     setSearchedCasts(filteredCasts);
            //   }
            // }}
          >
            <option value="all">الكل</option>
            <option value="تم التحصيل">تم التحصيل</option>
            <option value="مطلوب التحصيل">مطلوب التحصيل</option>
          </select>
        </div>
      </div>

      {/* عرض قائمة العملاء */}
      <div className="grid gap-4">
        {(searchedCasts.length > 0 || // لو كان في بحث
        searchCastValue.length > 0 // لو كان في قيمة بحث
          ? searchedCasts
          : casts
        ).map((cast: CastData) => (
          <Link
            key={cast._id}
            href={`/cast/${cast._id}`}
            className="group flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">{cast.name}</span>
              <span className="text-sm text-muted-foreground">
                {cast.phone ? `0${cast.phone}` : "رقم الهاتف غير متوفر"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{cast.area}</span>
              <ChevronLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
