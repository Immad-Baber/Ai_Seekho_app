"use client";

import { Star } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";
import { PageHeader } from "@/components/PageHeader";

export default function ProvidersPage() {
  const data = useOrchestration();
  return (
    <main className="p-4">
      <PageHeader title="Ustaad options" subtitle="AI ne rank kiya — best upar" />
      {!data?.matches?.length ? (
        <div className="card py-10 text-center text-ink-muted text-sm">
          Pehle home se service book karein
        </div>
      ) : (
        <div className="space-y-3">
          {data.matches.map((m) => (
            <div
              key={m.provider_id}
              className={`card p-4 ${m.selected ? "ring-2 ring-brand-500 bg-brand-50/40" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-ink text-lg">{m.name}</p>
                  <p className="text-xs text-ink-muted">{m.specialization.join(" · ")}</p>
                </div>
                {m.selected && (
                  <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    Best match
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-800">
                  <Star size={14} fill="currentColor" /> {(m.total_score * 100).toFixed(0)}%
                </span>
                {m.distance_km != null && (
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-ink-muted">
                    {m.distance_km} km
                  </span>
                )}
                {m.eta_minutes != null && (
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-ink-muted">
                    {m.eta_minutes} min
                  </span>
                )}
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-ink">
                  PKR {m.hourly_rate}/hr
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
