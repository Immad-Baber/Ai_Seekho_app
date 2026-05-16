"use client";

import Link from "next/link";
import { useOrchestration } from "@/hooks/useOrchestration";
import { PageHeader } from "@/components/PageHeader";

export default function SummaryPage() {
  const data = useOrchestration();
  if (!data) {
    return (
      <main className="p-4">
        <PageHeader title="Request ki details" subtitle="Pehle home se service book karein" />
        <Link href="/" className="btn-primary w-full text-center">
          Abhi book karein
        </Link>
      </main>
    );
  }
  const i = data.intent;
  return (
    <main className="p-4">
      <PageHeader title="Request summary" subtitle="AI ne ye samjha hai" />
      <div className="card divide-y divide-stone-100 overflow-hidden p-0">
        {[
          ["Aapka message", i.raw_message],
          ["Zubaan", i.detected_language],
          ["Service", i.service_type || "—"],
          ["Urgency", i.urgency],
          ["Jagah", i.location_text || "—"],
          ["Waqt", i.time_preference || "Flexible"],
          ["Status", data.status],
          ...(data.booking_id ? [["Booking ID", data.booking_id]] : []),
        ].map(([label, value]) => (
          <div key={String(label)} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <span className="text-ink-muted">{label}</span>
            <span className="font-semibold text-ink text-right capitalize">{value}</span>
          </div>
        ))}
      </div>
      <Link href="/confirm" className="btn-primary mt-6 block w-full text-center">
        Booking confirm karein
      </Link>
    </main>
  );
}
