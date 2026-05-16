"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProviderReputation() {
  const metrics = [
    { label: "Reliability", value: "92%" },
    { label: "On-time", value: "91%" },
    { label: "Completion", value: "96%" },
    { label: "Risk score", value: "8%" },
  ];
  return (
    <main className="p-4">
      <Link href="/provider" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Reputation Metrics</h1>
      {metrics.map((m) => (
        <div key={m.label} className="glass rounded-xl p-4 mb-2 flex justify-between">
          <span>{m.label}</span>
          <span className="font-bold text-brand-700">{m.value}</span>
        </div>
      ))}
    </main>
  );
}
