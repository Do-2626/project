"use client";

import Link from "next/link"; 
 
export default function Home() {
  return (
    <div className="min-h-screen">
      <Link href="/api/inventory" className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-white">المخزون</h2> 
      </Link>
    </div>
  );
}
