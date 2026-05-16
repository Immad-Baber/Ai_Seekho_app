"use client";

import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";

export default function ProvidersPage() {
  const data = useOrchestration();
  return (
    <main className="p-4">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/60 mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Provider Recommendations</h1>
      {!data?.matches?.length ? (
        <p className="text-white/60 text-sm">Run orchestration first.</p>
      ) : (
        <div className="space-y-3">
          {data.matches.map((m) => (
            <div
              key={m.provider_id}
              className={`glass rounded-2xl p-4 ${m.selected ? "border border-brand-500/50" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-white/50">{m.specialization.join(", ")}</p>
                </div>
                {m.selected && (
                  <span className="text-xs bg-brand-600/30 text-brand-300 px-2 py-0.5 rounded-full">Selected</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star size={14} fill="currentColor" /> {(m.total_score * 100).toFixed(0)}%
                </span>
                {m.distance_km != null && <span className="text-white/50">{m.distance_km} km</span>}
                {m.eta_minutes != null && <span className="text-white/50">ETA {m.eta_minutes}m</span>}
                <span className="text-white/50">PKR {m.hourly_rate}/hr</span>
              </div>
              {m.rejection_reasons.length > 0 && (
                <p className="text-xs text-red-300/80 mt-2">Rejected: {m.rejection_reasons.join("; ")}</p>
              )}
              <details className="mt-2 text-xs text-white/60">
                <summary className="cursor-pointer">Factor breakdown</summary>
                <ul className="mt-1 space-y-1">
                  {m.factor_scores?.slice(0, 6).map((f) => (
                    <li key={f.factor}>
                      {f.factor}: {(f.score * 100).toFixed(0)}% (w={(f.weighted * 100).toFixed(1)}%)
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
