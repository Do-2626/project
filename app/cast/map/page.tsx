"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { CastData } from "@/lib/types";
import L from "leaflet";

// تعريف الأيقونة المخصصة
const customIcon = L.divIcon({
  className: "custom-marker",
  html: `<svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className="text-primary"
  >
    <path
      fill="#2563eb"
      d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 12 24 12 24s8-12.198 8-16.398C20 3.403 16.199 0 12 0zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"
    />
  </svg>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

// تحميل الخريطة بشكل ديناميكي (Client-Side فقط)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export default function CastMapPage() {
  const [casts, setCasts] = useState<CastData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([30.0444, 31.2357]); // القيمة الافتراضية (القاهرة)

  // إضافة CSS للأيقونة المخصصة باستخدام useEffect
  useEffect(() => {
    const styles = `
      .custom-marker {
        background: none;
        border: none;
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // تنظيف الأنماط عند إلغاء التثبيت
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // جلب بيانات العملاء من الـ API
  useEffect(() => {
    const fetchCasts = async () => {
      try {
        const response = await fetch("/api/cast");
        if (!response.ok) {
          throw new Error("Failed to fetch casts");
        }
        const data = await response.json();
        // تصفية البيانات لاستبعاد العملاء بدون معلومات الموقع الجغرافي
        const filteredCasts = data.filter(
          (cast: CastData) => cast.latitude && cast.longitude
        );
        setCasts(filteredCasts);

        // حساب المتوسط الحسابي لخطوط الطول والعرض
        if (filteredCasts.length > 0) {
          const totalLat = filteredCasts.reduce(
            (sum: number, cast: CastData) => sum + cast.latitude!,
            0
          );
          const totalLng = filteredCasts.reduce(
            (sum: number, cast: CastData) => sum + cast.longitude!,
            0
          );
          const avgLat = totalLat / filteredCasts.length;
          const avgLng = totalLng / filteredCasts.length;
          setCenter([avgLat, avgLng]);
        }
      } catch (error) {
        console.error("Error fetching casts:", error);
        setError("فشل في جلب بيانات العملاء");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCasts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">خريطة العملاء</h1>
      <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-md">
        <MapContainer
          center={center} // استخدام المتوسط الحسابي كمركز للخريطة
          zoom={10}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {casts.map((cast) => (
            <Marker
              key={cast._id}
              position={[cast.latitude!, cast.longitude!]} // استخدام ! لأننا تأكدنا من وجود القيم
              icon={customIcon}
            >
              <Popup>
                <div className="space-y-2">
                  <h2 className="font-bold">{cast.name}</h2>
                  <p>رقم الهاتف: {cast.phone}</p>
                  <p>العنوان: {cast.area}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
