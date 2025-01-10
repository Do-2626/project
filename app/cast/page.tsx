"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchTodos();
  }, []);
  
  async function fetchTodos() {
    try {
      const response = await fetch("/api/cast");
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const data = await response.json();
      setCasts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      setCasts([]); // Ensure todos is always an array
    }
  }

  console.log("casts from cast/page.tsx: ", casts);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">قائمة العملاء</h1>
        <Link 
          href="/cast/add"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          إضافة عميل جديد
        </Link>
      </div>

      <div className="grid gap-4">
        {casts.map((cast: CastData, index: number) => (
          <Link 
            key={index}
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
