"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";

export default function SummaryPage() {
  const data = useOrchestration();
  if (!data) {
    return (
      <PageShell title="Request Summary">
        <p className="text-white/60 text-sm">No active request. <Link href="/" className="text-brand-400">Start chat</Link></p>
      </PageShell>
    );
  }
  const i = data.intent;
  return (
    <PageShell title="Request Summary">
      <div className="glass rounded-2xl p-4 space-y-3 text-sm">
        <Row label="Message" value={i.raw_message} />
        <Row label="Language" value={i.detected_language} />
        <Row label="Service" value={i.service_type || "—"} />
        <Row label="Urgency" value={i.urgency} />
        <Row label="Location" value={i.location_text || "—"} />
        <Row label="Time" value={i.time_preference || "Flexible"} />
        <Row label="Complexity" value={i.complexity} />
        <Row label="Confidence" value={`${Math.round(i.confidence * 100)}%`} />
        <Row label="Status" value={data.status} />
        {data.booking_id && <Row label="Booking" value={data.booking_id} />}
      </div>
      <Link href="/confirm" className="mt-4 block text-center py-3 rounded-xl bg-brand-600 font-medium">
        Continue to booking
      </Link>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
      <span className="text-white/50">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="p-4">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/60 mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">{title}</h1>
      {children}
    </main>
  );
}
