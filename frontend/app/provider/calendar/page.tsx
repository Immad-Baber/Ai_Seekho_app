"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProviderCalendar() {
  const slots = ["09:00", "10:00", "11:30", "14:00", "16:00"];
  return (
    <main className="p-4">
      <Link href="/provider" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Schedule Calendar</h1>
      <p className="text-sm text-ink-muted mb-4">Today — buffers applied for travel</p>
      <div className="space-y-2">
        {slots.map((s) => (
          <div key={s} className="flex justify-between glass rounded-xl p-3 text-sm">
            <span>{s}</span>
            <span className="text-ink-faint">{s === "10:00" || s === "14:00" ? "Booked" : "Open"}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
