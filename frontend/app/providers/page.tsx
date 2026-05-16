"use client";

import { Star, Bot, CheckCircle2, MapPin, Clock, Zap } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";

export default function ProvidersPage() {
  const data = useOrchestration();

  return (
    <main className="flex min-h-screen flex-col px-4 pt-4 pb-28">
      <PageHeader title="Ustaad Options" subtitle="AI ne best match dhundh liya" />

      {/* AI Decision Banner */}
      <div className="mb-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Bot size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">AI ne automatically choose kar liya</p>
            <p className="text-xs text-brand-100 mt-0.5">
              Rating, distance, availability aur price compare kiya
            </p>
          </div>
          <Zap size={18} className="text-brand-200 shrink-0" />
        </div>
      </div>

      {!data?.matches?.length ? (
        <div className="card py-12 text-center">
          <Bot className="mx-auto mb-3 text-ink-faint" size={40} />
          <p className="font-semibold text-ink">Pehle home se service book karein</p>
          <p className="text-sm text-ink-muted mt-1 mb-4">AI best ustaad dhundh lega</p>
          <Link href="/" className="btn-primary px-6">Dhundho →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.matches.map((m, idx) => (
            <div
              key={m.provider_id}
              className={`card p-4 transition ${
                m.selected
                  ? "ring-2 ring-brand-500 bg-brand-50/40 shadow-card-hover"
                  : "opacity-75"
              }`}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-ink text-base truncate">{m.name}</p>
                    {idx === 0 && (
                      <span className="shrink-0 text-[10px] font-bold text-ink-faint">#{idx + 1}</span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">{m.specialization.join(" · ")}</p>
                </div>

                {m.selected ? (
                  <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold text-white">
                    <CheckCircle2 size={12} /> AI Choice
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
                    #{idx + 1}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-800">
                  <Star size={12} fill="currentColor" />
                  {(m.total_score * 100).toFixed(0)}% match
                </span>
                {m.distance_km != null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-ink-muted">
                    <MapPin size={11} /> {m.distance_km} km
                  </span>
                )}
                {m.eta_minutes != null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-ink-muted">
                    <Clock size={11} /> {m.eta_minutes} min ETA
                  </span>
                )}
                <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-ink">
                  PKR {m.hourly_rate}/hr
                </span>
              </div>

              {/* AI selection note */}
              {m.selected && (
                <div className="mt-3 rounded-xl bg-brand-50 border border-brand-100 px-3 py-2 text-xs text-brand-700 flex items-center gap-2">
                  <Bot size={13} />
                  <span>AI ne inhe best match select kiya — automatically assign ho raha hai</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CTA — go straight to confirm */}
      {data?.selected_provider && (
        <div className="mt-5 space-y-2">
          <Link href="/confirm" className="btn-primary block w-full text-center py-4 text-base">
            ✅ Confirm karo → {data.selected_provider.name}
          </Link>
          <Link href="/pricing" className="btn-secondary block w-full text-center">
            Qeemat dekho
          </Link>
        </div>
      )}
    </main>
  );
}
