"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProviderEarnings() {
  return (
    <main className="p-4">
      <Link href="/provider" className="inline-flex items-center gap-1 text-sm text-white/60 mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Earnings Analytics</h1>
      <div className="glass rounded-2xl p-4 mb-4">
        <p className="text-sm text-white/50">This week</p>
        <p className="text-3xl font-bold gradient-text">PKR 48,200</p>
      </div>
      <div className="h-32 glass rounded-xl flex items-end justify-around p-4 gap-1">
        {[40, 65, 55, 80, 70, 90, 60].map((h, i) => (
          <div key={i} className="w-6 bg-brand-500/60 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
      <p className="text-xs text-white/40 mt-2 text-center">BigQuery demand sync (demo)</p>
    </main>
  );
}
