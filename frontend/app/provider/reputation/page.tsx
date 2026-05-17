"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Star, TrendingUp, Shield, Clock,
  CheckCircle2, ThumbsUp, Award, Zap, Inbox,
} from "lucide-react";
import {
  getUser,
  getProviderStats,
  getProviderReviews,
  type AuthUser,
  type ProviderReview,
} from "@/lib/auth";

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
  const router = useRouter();
  const [tab, setTab] = useState<"metrics" | "reviews">("metrics");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getProviderStats> | null>(null);
  const [reviews, setReviews] = useState<ProviderReview[]>([]);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "provider") { router.push("/select-role"); return; }
    setUser(u);
    setStats(getProviderStats(u.phone));
    setReviews(getProviderReviews(u.phone));
  }, [router]);

  if (!user || !stats) return null;

  const hasData = stats.totalReviews > 0;
  const avgRating = hasData ? parseFloat(stats.avgRating) : 0;
  const trustScore = hasData
    ? Math.round(avgRating * 20 * 0.5 + parseInt(stats.completionRate) * 0.3 + parseInt(stats.onTimeRate) * 0.2)
    : 0;

  // Star distribution from actual reviews
  const starDist = [5, 4, 3, 2, 1].map((s) => {
    const count = reviews.filter((r) => r.rating === s).length;
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { stars: s, count, pct };
  });

  const METRICS = hasData ? [
    { icon: Clock,       label: "On-time Rate",     value: stats.onTimeRate,      sub: "Based on completions",  color: "bg-brand-50 text-brand-700",   bar: parseInt(stats.onTimeRate) },
    { icon: CheckCircle2,label: "Completion Rate",  value: stats.completionRate,  sub: "Jobs delivered",        color: "bg-green-50 text-green-700",   bar: parseInt(stats.completionRate) },
    { icon: TrendingUp,  label: "Total Jobs",       value: String(stats.totalJobs), sub: "All assignments",   color: "bg-purple-50 text-purple-700", bar: Math.min(stats.totalJobs * 10, 100) },
    { icon: ThumbsUp,    label: "Reviews",          value: String(stats.totalReviews), sub: "Total reviews",  color: "bg-amber-50 text-amber-700",   bar: Math.min(stats.totalReviews * 10, 100) },
    { icon: Zap,         label: "Avg Rating",       value: `${stats.avgRating}★`, sub: "Out of 5",            color: "bg-sky-50 text-sky-700",       bar: Math.round(avgRating * 20) },
    { icon: Shield,      label: "Cancelled",        value: String(stats.cancelledJobs), sub: "Total cancelled", color: "bg-red-50 text-red-700", bar: stats.totalJobs > 0 ? Math.round((stats.cancelledJobs / stats.totalJobs) * 100) : 0 },
  ] : [];

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
          <TrustRing score={trustScore} />
          <div className="flex-1">
            {hasData ? (
              <>
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={18} className={s <= Math.round(avgRating) ? "fill-white text-white" : "fill-white/40 text-white/40"} />
                  ))}
                </div>
                <p className="text-3xl font-bold">{stats.avgRating}</p>
                <p className="text-accent-100 text-sm">{stats.totalReviews} total reviews</p>
                {avgRating >= 4.5 && (
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">
                    <Award size={12} /> Premium Badge
                  </span>
                )}
              </>
            ) : (
              <>
                <p className="text-xl font-bold">No Reviews Yet</p>
                <p className="text-accent-100 text-sm mt-1">Complete jobs to build your reputation</p>
                <p className="text-accent-100/70 text-xs mt-2">Rating aur trust score jobs complete karne ke baad dikhega</p>
              </>
            )}
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
          {hasData ? (
            <>
              {/* Star Distribution */}
              <div className="card mb-4 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-3">Star Breakdown</p>
                <div className="space-y-2">
                  {starDist.map((d) => (
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
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-stone-100 mb-4">
                <Inbox size={28} className="text-ink-faint" />
              </div>
              <p className="font-bold text-ink text-base">Koi data nahi hai</p>
              <p className="text-sm text-ink-muted mt-1">Jobs complete karein — metrics yahan dikhenge</p>
            </div>
          )}
        </>
      )}

      {tab === "reviews" && (
        <>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-bold text-ink text-sm">{r.customerName}</p>
                      <p className="text-xs text-ink-muted">{r.service} · {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={12} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed">&quot;{r.comment}&quot;</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-stone-100 mb-4">
                <Star size={28} className="text-ink-faint" />
              </div>
              <p className="font-bold text-ink text-base">Koi review nahi hai</p>
              <p className="text-sm text-ink-muted mt-1">Customers ke reviews yahan dikhenge</p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
