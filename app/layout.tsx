import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "تطبيق المهام",
  description: "تطبيق لإدارة المهام اليومية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${inter.className} min-h-screen antialiased bg-background`}
      >
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto my-5 px-4 max-w-5xl">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
