"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, XCircle, CheckCircle2, AlertTriangle,
  TrendingDown, RefreshCw, Bot, ChevronDown, ChevronUp,
} from "lucide-react";

const HISTORY = [
  {
    id: "C-001", date: "May 14, 2026", service: "AC Repair", customer: "Ali Khan",
    reason: "Tabiyat theek nahi thi", reAssigned: "Muhammad Tariq", time: "9:42 AM",
    impact: "low",
  },
  {
    id: "C-002", date: "May 9, 2026", service: "Geyser Leak", customer: "Sara Iqbal",
    reason: "Gaari kharab ho gayi", reAssigned: "Zahid Hussain", time: "11:15 AM",
    impact: "medium",
  },
  {
    id: "C-003", date: "Apr 28, 2026", service: "Fan Wiring", customer: "Ahmed Raza",
    reason: "Emergency (ghar mein masla)", reAssigned: "Khalid Mehmood", time: "2:30 PM",
    impact: "low",
  },
];

const IMPACT_BADGE: Record<string, string> = {
  low:    "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high:   "bg-red-100 text-red-700",
};

export default function ProviderCancellations() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const rate = 4;
  const total = 47 + HISTORY.length;
  const industryAvg = 12;
  const target = 8;

  return (
    <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/provider" className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-ink-muted hover:bg-stone-200 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Cancellations</h1>
          <p className="text-xs text-ink-muted">Track record & AI re-assignment</p>
        </div>
      </div>

      {/* Score Hero */}
      <div className="mb-4 rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 p-5 text-white shadow-lg">
        <p className="text-sm text-green-100 font-medium mb-1">30-day cancellation rate</p>
        <div className="flex items-end gap-3 mb-4">
          <p className="text-6xl font-bold">{rate}%</p>
          <div className="pb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">
              <CheckCircle2 size={12} /> Excellent
            </span>
          </div>
        </div>

        {/* Benchmarks */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            [`${rate}%`, "Aapka", "text-white"],
            [`${industryAvg}%`, "Industry avg", "text-green-200"],
            [`${target}%`, "Target", "text-amber-200"],
          ].map(([val, lbl, col]) => (
            <div key={lbl} className="rounded-2xl bg-white/10 py-2.5">
              <p className={`text-lg font-bold ${col}`}>{val}</p>
              <p className="text-[10px] text-green-100 mt-0.5">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="card mb-4 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-ink">Badge Status</p>
          <span className="text-xs font-bold rounded-full bg-green-100 text-green-700 px-2 py-0.5">Premium ✅</span>
        </div>
        <div className="h-3 rounded-full bg-stone-100 overflow-hidden mb-2">
          <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${(rate / target) * 100}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-ink-muted font-semibold">
          <span>0% (Perfect)</span>
          <span>{target}% (Target)</span>
          <span>{industryAvg}% (Avg)</span>
        </div>
        <p className="mt-2 text-xs text-green-600 font-medium">
          ✅ Aap target se {target - rate}% neeche hain — Premium Badge active hai!
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Total Jobs", value: String(total), icon: CheckCircle2, color: "bg-brand-50 text-brand-700" },
          { label: "Cancelled", value: String(HISTORY.length), icon: XCircle, color: "bg-red-50 text-red-600" },
          { label: "Re-Assigned", value: String(HISTORY.length), icon: RefreshCw, color: "bg-purple-50 text-purple-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-3 text-center ${s.color.split(" ")[0]}`}>
            <s.icon size={18} className={`mx-auto mb-1 ${s.color.split(" ")[1]}`} />
            <p className={`text-xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
            <p className="text-[10px] text-ink-muted font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Note */}
      <div className="mb-4 rounded-2xl bg-purple-50 border border-purple-200 p-4 flex gap-3">
        <Bot size={18} className="text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-purple-700 text-sm">AI Auto Re-Assignment</p>
          <p className="text-xs text-purple-600 mt-0.5 leading-relaxed">
            Har cancellation ke baad AI automatically next best ustaad dhundh leta hai
            aur customer ko notify karta hai — average re-assignment time: <strong>3.2 minutes</strong>
          </p>
        </div>
      </div>

      {/* Cancellation History */}
      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-3">
        Cancellation History ({HISTORY.length})
      </p>
      <div className="space-y-2">
        {HISTORY.map((c) => {
          const isOpen = expanded === c.id;
          return (
            <div key={c.id} className="card overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : c.id)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <XCircle size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-ink text-sm">{c.service}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${IMPACT_BADGE[c.impact]}`}>
                      {c.impact} impact
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">{c.date} · {c.time}</p>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-ink-faint shrink-0" /> : <ChevronDown size={16} className="text-ink-faint shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-stone-100 px-4 pb-4 pt-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-ink-muted uppercase tracking-wide">Wajah</p>
                      <p className="text-sm text-ink">{c.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <RefreshCw size={14} className="text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-ink-muted uppercase tracking-wide">AI ne assign kiya</p>
                      <p className="text-sm text-ink font-semibold">{c.reAssigned}</p>
                      <p className="text-xs text-green-600 font-medium">✅ Customer notify ho gaya</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingDown size={14} className="text-ink-muted shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-ink-muted uppercase tracking-wide">Customer</p>
                      <p className="text-sm text-ink">{c.customer}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-ink-faint font-mono">ID: {c.id}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
