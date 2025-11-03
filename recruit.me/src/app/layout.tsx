import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recruit.Me",
  description: "Connecting applicants and companies effortlessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body className="flex flex-col min-h-screen font-sans">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto text-center py-8">
          <Link href="/">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight cursor-pointer">
                  <span className="text-blue-600">Recruit.Me</span>
              </h1>
          </Link>
      </header>

      {/* Page Content */}
      <main className="flex-grow flex justify-center items-start mt-8 px-6">
          <Suspense fallback={<div>Loading...</div>}>
              {children}
          </Suspense>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center py-6 mt-8 text-zinc-500 dark:text-zinc-500 text-sm">
          © {new Date().getFullYear()} Recruit.Me — All rights reserved.
      </footer>
      </body>
      </html>
  );
}
