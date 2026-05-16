"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const JOBS = [
  { id: "J1", service: "AC gas refill", area: "G-13", time: "10:00 AM", pay: 4500 },
  { id: "J2", service: "Geyser leak plumber", area: "G-10", time: "11:30 AM", pay: 2800 },
  { id: "J3", service: "Electrician fan wiring", area: "F-8", time: "2:00 PM", pay: 2600 },
  { id: "J4", service: "Airport drop driver", area: "F-7", time: "6:30 AM", pay: 1800 },
  { id: "J5", service: "Deep safai team", area: "Bahria", time: "4:00 PM", pay: 3600 },
];

export default function ProviderJobs() {
  return (
    <main className="p-4">
      <Link href="/provider" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Job Requests</h1>
      {JOBS.map((j) => (
        <div key={j.id} className="glass rounded-xl p-4 mb-3">
          <p className="font-medium">{j.service}</p>
          <p className="text-sm text-ink-muted">{j.area} · {j.time}</p>
          <p className="text-brand-700 mt-2">PKR {j.pay.toLocaleString()}</p>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 rounded-lg bg-brand-600 text-sm">Accept</button>
            <button className="flex-1 py-2 rounded-lg glass text-sm">Decline</button>
          </div>
        </div>
      ))}
    </main>
  );
}
