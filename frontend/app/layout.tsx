import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "ServiceFlow AI",
  description: "AI Service Orchestrator for Informal Economy",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0e17",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="pb-20">
        <div className="mx-auto min-h-screen max-w-lg">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
