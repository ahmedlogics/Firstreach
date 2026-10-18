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
  title: "FirstReach — Disaster Response Intelligence Platform",
  description:
    "Prioritize flood emergencies by life-threat urgency, unmask silent high-risk households, and allocate rescue assets with operational intelligence.",
};

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
      <head>
        {/* Emergency styling link injection */}
        <link href="https://jsdelivr.net" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F7F6F2] text-[#252A30]">
        {children}
      </body>
    </html>
  );
}
