import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAABTA — Disaster Response & Coordination",
  description:
    "Connecting vulnerable people, emergency coordinators, and rescue resources before situations become critical.",
  icons: {
    icon: "/icon.svg",
  },
};

import { AuthProvider } from "@/lib/auth/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F7F8FA] text-[#18232D]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
