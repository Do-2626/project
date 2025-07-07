import "./globals.css";
import type { Metadata } from "next"; 

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
      <body
        // className={`${inter.className} min-h-screen antialiased bg-background`}
        className={`min-h-screen antialiased bg-background`}
      >
        <main className="container mx-auto my-5 px-4 max-w-5xl">
          {children}
        </main> 
      </body>
    </html>
  );
}
