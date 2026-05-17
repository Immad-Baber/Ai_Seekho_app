"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, XCircle, CheckCircle2, AlertTriangle,
  TrendingDown, RefreshCw, Bot, ChevronDown, ChevronUp, Inbox,
} from "lucide-react";
import { getUser, getProviderJobs, getProviderStats, type AuthUser, type ProviderJob } from "@/lib/auth";

interface CancellationEntry {
  id: string;
  date: string;
  service: string;
  customer: string;
  reason: string;
  reAssigned: string;
  time: string;
  impact: "low" | "medium" | "high";
}

const IMPACT_BADGE: Record<string, string> = {
  low:    "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high:   "bg-red-100 text-red-700",
};

export default function ProviderCancellations() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [history, setHistory] = useState<CancellationEntry[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getProviderStats> | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "provider") { router.push("/select-role"); return; }
    setUser(u);

    const providerStats = getProviderStats(u.phone);
    setStats(providerStats);

    // Build cancellation history from actual cancelled jobs
    const jobs = getProviderJobs(u.phone);
    const cancelledJobs = jobs.filter((j) => j.status === "cancelled");

    const entries: CancellationEntry[] = cancelledJobs.map((j, i) => {
      const d = new Date(j.assignedAt);
      const reAssignedName = j.reAssignedTo
        ? (typeof j.reAssignedTo === "object" && j.reAssignedTo !== null && "name" in j.reAssignedTo
          ? (j.reAssignedTo as { name: string }).name
          : "AI Agent")
        : "Koi nahi mila";

      return {
        id: `C-${String(i + 1).padStart(3, "0")}`,
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        service: j.service,
        customer: j.customer,
        reason: j.cancelReason || "Wajah nahi batai",
        reAssigned: reAssignedName,
        time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        impact: i === 0 ? "low" : i === 1 ? "medium" : "low",
      };
    });

    setHistory(entries);
  }, [router]);

  if (!user || !stats) return null;

  const totalJobs = stats.totalJobs;
  const cancelledCount = stats.cancelledJobs;
  const rate = totalJobs > 0 ? Math.round((cancelledCount / totalJobs) * 100) : 0;
  const industryAvg = 12;
  const target = 8;

  const getBadge = () => {
    if (rate === 0 && totalJobs === 0) return { label: "New", color: "bg-stone-100 text-stone-600" };
    if (rate <= 5) return { label: "Excellent ✅", color: "bg-white/20" };
    if (rate <= target) return { label: "Good 👍", color: "bg-white/20" };
    return { label: "Needs Work ⚠️", color: "bg-amber-100 text-amber-700" };
  };

  const badge = getBadge();

  const getHeroGradient = () => {
    if (totalJobs === 0) return "from-stone-500 to-stone-600";
    if (rate <= 5) return "from-green-600 to-emerald-700";
    if (rate <= target) return "from-amber-500 to-amber-600";
    return "from-red-500 to-red-600";
  };

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
      <div className={`mb-4 rounded-3xl bg-gradient-to-br ${getHeroGradient()} p-5 text-white shadow-lg`}>
        <p className="text-sm text-white/80 font-medium mb-1">Cancellation rate</p>
        <div className="flex items-end gap-3 mb-4">
          <p className="text-6xl font-bold">{totalJobs === 0 ? "—" : `${rate}%`}</p>
          <div className="pb-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${badge.color}`}>
              {totalJobs > 0 && <CheckCircle2 size={12} />} {badge.label}
            </span>
          </div>
        </div>

        {/* Benchmarks */}
        {totalJobs > 0 ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              [`${rate}%`, "Aapka", "text-white"],
              [`${industryAvg}%`, "Industry avg", "text-white/70"],
              [`${target}%`, "Target", "text-amber-200"],
            ].map(([val, lbl, col]) => (
              <div key={lbl} className="rounded-2xl bg-white/10 py-2.5">
                <p className={`text-lg font-bold ${col}`}>{val}</p>
                <p className="text-[10px] text-white/60 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/70">Abhi koi job data nahi hai — jobs complete karein to stats dikhenge</p>
        )}
      </div>

      {/* Progress bar */}
      {totalJobs > 0 && (
        <div className="card mb-4 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-ink">Badge Status</p>
            <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${
              rate <= 5 ? "bg-green-100 text-green-700" : rate <= target ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
            }`}>
              {rate <= 5 ? "Premium ✅" : rate <= target ? "Good 👍" : "At Risk ⚠️"}
            </span>
          </div>
          <div className="h-3 rounded-full bg-stone-100 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full ${rate <= 5 ? "bg-gradient-to-r from-green-400 to-green-600" : rate <= target ? "bg-gradient-to-r from-amber-400 to-amber-600" : "bg-gradient-to-r from-red-400 to-red-600"}`}
              style={{ width: `${Math.min((rate / target) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-ink-muted font-semibold">
            <span>0% (Perfect)</span>
            <span>{target}% (Target)</span>
            <span>{industryAvg}% (Avg)</span>
          </div>
          {rate <= target ? (
            <p className="mt-2 text-xs text-green-600 font-medium">
              ✅ Aap target se {target - rate}% neeche hain — {rate <= 5 ? "Premium Badge active hai!" : "Keep it up!"}
            </p>
          ) : (
            <p className="mt-2 text-xs text-red-600 font-medium">
              ⚠️ Aapka rate target se upar hai — cancellations kam karein
            </p>
          )}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Total Jobs", value: String(totalJobs), icon: CheckCircle2, color: "bg-brand-50 text-brand-700" },
          { label: "Cancelled", value: String(cancelledCount), icon: XCircle, color: "bg-red-50 text-red-600" },
          { label: "Re-Assigned", value: String(history.filter((h) => h.reAssigned !== "Koi nahi mila").length), icon: RefreshCw, color: "bg-purple-50 text-purple-700" },
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
            aur customer ko notify karta hai
          </p>
        </div>
      </div>

      {/* Cancellation History */}
      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-3">
        Cancellation History ({history.length})
      </p>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-green-50 mb-4">
            <CheckCircle2 size={28} className="text-green-400" />
          </div>
          <p className="font-bold text-ink text-base">Koi cancellation nahi!</p>
          <p className="text-sm text-ink-muted mt-1">
            {totalJobs === 0 ? "Abhi koi job nahi hui — yahan cancellation history dikhegi" : "Bahut acha! Aapne koi job cancel nahi ki"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((c) => {
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
                        {c.reAssigned !== "Koi nahi mila" && (
                          <p className="text-xs text-green-600 font-medium">✅ Customer notify ho gaya</p>
                        )}
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
      )}
    </main>
  );
}
