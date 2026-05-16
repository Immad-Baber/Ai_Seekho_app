"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProviderRoutes() {
  return (
    <main className="p-4">
      <Link href="/provider" className="inline-flex items-center gap-1 text-sm text-white/60 mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Route Optimization</h1>
      <div className="glass rounded-2xl p-4 h-48 flex items-center justify-center text-white/40 text-sm">
        Google Maps optimized route (3 stops)
      </div>
      <ol className="mt-4 space-y-2 text-sm">
        <li>1. G-13 — 10:00 AM</li>
        <li>2. G-10 — 2:00 PM</li>
        <li>3. F-7 — 5:30 PM</li>
      </ol>
    </main>
  );
}
