"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { text: "المهام", href: "/" },
    { text: "العملاء", href: "/cast" },
    { text: "الخريطة", href: "/cast/map" },
    { text: "الملف الشخصي", href: "/profile" },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              تطبيق المهام
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 space-x-reverse">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="hover:text-blue-600"
              >
                {link.text}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {links.map((link, index) => (
                <Link
                  className="block px-3 py-2 rounded-md hover:bg-gray-100"
                  key={index}
                  href={link.href}
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
