import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ustaad PK — Apna kaam, sahi ustaad",
  description: "Pakistan ka smart service app. AC, plumber, electrician aur har kaam ke liye trusted ustaad.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans pb-24">
        <div className="mx-auto min-h-screen max-w-lg">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
