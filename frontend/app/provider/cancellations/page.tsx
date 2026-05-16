"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProviderCancellations() {
  return (
    <main className="p-4">
      <Link href="/provider" className="inline-flex items-center gap-1 text-sm text-white/60 mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Cancellation Analytics</h1>
      <div className="glass rounded-2xl p-4">
        <p className="text-4xl font-bold text-green-400">4%</p>
        <p className="text-sm text-white/50">30-day cancellation rate</p>
        <p className="text-xs text-white/40 mt-4">Industry avg: 12% · Keep below 8% for premium badge</p>
      </div>
    </main>
  );
}
