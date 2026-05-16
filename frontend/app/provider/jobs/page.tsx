"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const JOBS = [
  { id: "J1", service: "AC gas refill", area: "G-13", time: "10:00 AM", pay: 4500 },
  { id: "J2", service: "AC not cooling", area: "G-10", time: "2:00 PM", pay: 3200 },
];

export default function ProviderJobs() {
  return (
    <main className="p-4">
      <Link href="/provider" className="inline-flex items-center gap-1 text-sm text-white/60 mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Job Requests</h1>
      {JOBS.map((j) => (
        <div key={j.id} className="glass rounded-xl p-4 mb-3">
          <p className="font-medium">{j.service}</p>
          <p className="text-sm text-white/50">{j.area} · {j.time}</p>
          <p className="text-brand-300 mt-2">PKR {j.pay.toLocaleString()}</p>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 rounded-lg bg-brand-600 text-sm">Accept</button>
            <button className="flex-1 py-2 rounded-lg glass text-sm">Decline</button>
          </div>
        </div>
      ))}
    </main>
  );
}
