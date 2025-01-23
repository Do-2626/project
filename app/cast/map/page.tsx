"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { CastData } from "@/lib/types";

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

// تحميل leaflet بشكل ديناميكي
const L = dynamic(() => import("leaflet"), { ssr: false });

export default function CastMapPage() {
  const [casts, setCasts] = useState<CastData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([30.0444, 31.2357]); // القيمة الافتراضية (القاهرة)

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
              icon={L.icon({
                iconUrl: "/marker-icon.png", // مسار الأيقونة
                iconSize: [25, 41], // حجم الأيقونة
                iconAnchor: [12, 41], // نقطة تثبيت الأيقونة
              })}
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
