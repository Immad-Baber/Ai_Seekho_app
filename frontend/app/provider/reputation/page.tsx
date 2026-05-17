"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Star, TrendingUp, Shield, Clock,
  CheckCircle2, ThumbsUp, Award, Zap,
} from "lucide-react";

const REVIEWS = [
  { name: "Ali Khan", service: "AC Gas Refill", rating: 5, comment: "Bahut acha kaam kiya, waqt par aya!", time: "Aaj" },
  { name: "Fatima Malik", service: "Geyser Repair", rating: 5, comment: "Very professional, highly recommend!", time: "Kal" },
  { name: "Ahmed Raza", service: "Fan Wiring", rating: 4, comment: "Theek kaam tha, thoda late tha.", time: "2 din pehle" },
  { name: "Sara Iqbal", service: "Airport Drop", rating: 5, comment: "Punctual aur safe driver!", time: "3 din pehle" },
  { name: "Umar Farooq", service: "Deep Cleaning", rating: 4, comment: "Safai achi thi, price thodi zyada.", time: "1 hafta pehle" },
];

const STAR_DIST = [
  { stars: 5, count: 34, pct: 72 },
  { stars: 4, count: 9,  pct: 19 },
  { stars: 3, count: 3,  pct: 6  },
  { stars: 2, count: 1,  pct: 2  },
  { stars: 1, count: 0,  pct: 0  },
];

const METRICS = [
  { icon: Clock,       label: "On-time Rate",     value: "91%",  sub: "Industry: 78%",   color: "bg-brand-50 text-brand-700",   bar: 91 },
  { icon: CheckCircle2,label: "Completion Rate",  value: "96%",  sub: "Jobs delivered",  color: "bg-green-50 text-green-700",   bar: 96 },
  { icon: TrendingUp,  label: "Reliability",      value: "92%",  sub: "Consistency",     color: "bg-purple-50 text-purple-700", bar: 92 },
  { icon: ThumbsUp,    label: "Repeat Customers", value: "62%",  sub: "Return rate",     color: "bg-amber-50 text-amber-700",   bar: 62 },
  { icon: Zap,         label: "Response Time",    value: "4 min",sub: "To accept jobs",  color: "bg-sky-50 text-sky-700",       bar: 88 },
  { icon: Shield,      label: "Risk Score",       value: "8%",   sub: "Low = better",    color: "bg-red-50 text-red-700",       bar: 8  },
];

// Simple SVG ring
function TrustRing({ score }: { score: number }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} stroke="#e7e5e4" strokeWidth="10" fill="none" />
        <circle cx="72" cy="72" r={r} stroke="url(#tg)" strokeWidth="10" fill="none"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <p className="text-3xl font-bold text-ink">{score}</p>
        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wide">Trust Score</p>
      </div>
    </div>
  );
}

export default function ProviderReputation() {
  const [tab, setTab] = useState<"metrics" | "reviews">("metrics");

  return (
    <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/provider" className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-ink-muted hover:bg-stone-200 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Reputation</h1>
          <p className="text-xs text-ink-muted">Rating & Trust Score</p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="mb-4 rounded-3xl bg-gradient-to-br from-accent-600 to-amber-700 p-5 text-white shadow-lg">
        <div className="flex items-center gap-5">
          <TrustRing score={87} />
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={18} className={s <= 4 ? "fill-white text-white" : "fill-white/40 text-white/40"} />
              ))}
            </div>
            <p className="text-3xl font-bold">4.8</p>
            <p className="text-accent-100 text-sm">47 total reviews</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">
              <Award size={12} /> Premium Badge
            </span>
          </div>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="mb-4 flex rounded-2xl bg-stone-100 p-1">
        {(["metrics", "reviews"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${tab === t ? "bg-white text-ink shadow-sm" : "text-ink-muted"}`}>
            {t === "metrics" ? "📊 Metrics" : "⭐ Reviews"}
          </button>
        ))}
      </div>

      {tab === "metrics" && (
        <>
          {/* Star Distribution */}
          <div className="card mb-4 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-3">Star Breakdown</p>
            <div className="space-y-2">
              {STAR_DIST.map((d) => (
                <div key={d.stars} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink-muted w-4">{d.stars}</span>
                  <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="text-xs text-ink-muted w-6 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            {METRICS.map((m) => (
              <div key={m.label} className={`rounded-2xl p-4 ${m.color.split(" ")[0]}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 mb-2 ${m.color.split(" ")[1]}`}>
                  <m.icon size={18} />
                </div>
                <p className={`text-2xl font-bold ${m.color.split(" ")[1]}`}>{m.value}</p>
                <p className="text-xs font-semibold text-ink mt-0.5">{m.label}</p>
                <p className="text-[10px] text-ink-muted">{m.sub}</p>
                <div className="mt-2 h-1.5 rounded-full bg-white/60 overflow-hidden">
                  <div className={`h-full rounded-full ${m.color.split(" ")[1].replace("text-", "bg-")}`}
                    style={{ width: `${Math.min(m.bar, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "reviews" && (
        <div className="space-y-3">
          {REVIEWS.map((r, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold text-ink text-sm">{r.name}</p>
                  <p className="text-xs text-ink-muted">{r.service} · {r.time}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={12} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">"{r.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
