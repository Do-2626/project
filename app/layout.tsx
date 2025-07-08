import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "تطبيق المخزون",
  description: "تطبيق لإدارة المخزون",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* تمت إزالة Font Awesome CDN لأن المشروع يستخدم react-icons فقط */}
      </head>
      <body
        // className={`${inter.className} min-h-screen antialiased bg-background`}
        className={`min-h-screen antialiased bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 bg-fixed text-gray-300 font-cairo`}
      >
        <main className="container mx-auto py-2 max-w-5xl">
          {children}
        </main> 
      </body>
    </html>
  );
}
