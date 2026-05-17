"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, type AuthUser } from "@/lib/auth";
import {
  ArrowLeft, DollarSign, ChevronLeft, ChevronRight,
  Star, Clock, CheckCircle2, X,
} from "lucide-react";

// ─── Calendar Data ───────────────────────────────────────────────────────────

const CALENDAR_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const CALENDAR_DATES: (number | null)[][] = [
  [null, null, null, 1, 2, 3, 4],
  [5, 6, 7, 8, 9, 10, 11],
  [12, 13, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24, 25],
  [26, 27, 28, 29, 30, 31, null],
];

interface DayJob { service: string; customer: string; area: string; amount: number; rating: number; }

// Per-date earnings data — single source of truth for both graph & calendar
const DEMO_DATE_EARNINGS: Record<number, { total: number; jobs: DayJob[] }> = {
  1:  { total: 4500, jobs: [{ service: "AC Gas Refill", customer: "Ali Khan", area: "G-13", amount: 4500, rating: 5 }] },
  2:  { total: 2800, jobs: [{ service: "Geyser Repair", customer: "Fatima Malik", area: "G-10", amount: 2800, rating: 5 }] },
  3:  { total: 6400, jobs: [
    { service: "Fan Wiring", customer: "Ahmed Raza", area: "F-8", amount: 2600, rating: 4 },
    { service: "Airport Drop", customer: "Sara Iqbal", area: "F-7", amount: 1800, rating: 5 },
    { service: "Deep Cleaning", customer: "Umar Farooq", area: "Bahria", amount: 2000, rating: 4 },
  ]},
  4:  { total: 3200, jobs: [{ service: "Car Repair", customer: "Bilal Ahmed", area: "G-11", amount: 3200, rating: 4 }] },
  5:  { total: 5100, jobs: [
    { service: "AC Service", customer: "Hina Nawaz", area: "I-8", amount: 3100, rating: 5 },
    { service: "Washing Machine", customer: "Rashid Ali", area: "G-10", amount: 2000, rating: 4 },
  ]},
  7:  { total: 4200, jobs: [{ service: "Home Cleaning", customer: "Ayesha Khan", area: "F-7", amount: 4200, rating: 5 }] },
  9:  { total: 2600, jobs: [{ service: "Fan Installation", customer: "Zaid Mehmood", area: "G-13", amount: 2600, rating: 4 }] },
  11: { total: 7800, jobs: [
    { service: "AC Full Service", customer: "Nadia Iqbal", area: "Bahria", amount: 5000, rating: 5 },
    { service: "Geyser Repair", customer: "Arif Shah", area: "G-9", amount: 2800, rating: 5 },
  ]},
  12: { total: 3600, jobs: [{ service: "Deep Cleaning", customer: "Sana Malik", area: "F-8", amount: 3600, rating: 4 }] },
  13: { total: 3200, jobs: [{ service: "Plumbing Fix", customer: "Imran Ali", area: "G-11", amount: 3200, rating: 5 }] },
  14: { total: 4800, jobs: [
    { service: "Electrician Work", customer: "Omar Farooq", area: "G-10", amount: 2400, rating: 4 },
    { service: "Plumbing", customer: "Kamran Beg", area: "G-13", amount: 2400, rating: 5 },
  ]},
  15: { total: 5300, jobs: [
    { service: "AC Gas Refill", customer: "Tariq Hussain", area: "I-8", amount: 3300, rating: 5 },
    { service: "Fan Repair", customer: "Zubair Khan", area: "G-9", amount: 2000, rating: 4 },
  ]},
  16: { total: 5500, jobs: [{ service: "AC Installation", customer: "Maryam Javed", area: "I-8", amount: 5500, rating: 5 }] },
  17: { total: 10100, jobs: [
    { service: "AC Gas Refill", customer: "Ali Khan", area: "G-13", amount: 4500, rating: 5 },
    { service: "Geyser Repair", customer: "Fatima Malik", area: "G-10", amount: 2800, rating: 5 },
    { service: "Fan Wiring", customer: "Ahmed Raza", area: "F-8", amount: 2800, rating: 4 },
  ]},
};

const DEMO_COMPLETED_DATES = new Set([1, 2, 3, 4, 5, 7, 9, 11, 12, 13, 14, 15, 16, 17]);
const DEMO_BOOKED_DATES = new Set([18, 20, 22, 24]);

const CURRENT_WEEK_MAP: { day: string; label: string; date: number }[] = [
  { day: "Mon", label: "Mon", date: 13 },
  { day: "Tue", label: "Tue", date: 14 },
  { day: "Wed", label: "Wed", date: 15 },
  { day: "Thu", label: "Thu", date: 16 },
  { day: "Fri", label: "Fri", date: 17 },
  { day: "Sat", label: "Sat", date: 18 },
  { day: "Sun", label: "Sun", date: 12 },
];

export default function ProviderEarnings() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  
  const [mode, setMode] = useState<"weekly" | "monthly">("weekly");
  const [barSelected, setBarSelected] = useState<number | null>(null);
  const [calMonth, setCalMonth] = useState("May 2026");
  const [calDay, setCalDay] = useState<number | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "provider") { router.push("/select-role"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  // If user is new (not the demo phone), show zero earnings
  const isDemoUser = user.phone.replace(/-/g, "") === "03001234567";
  const DATE_EARNINGS = isDemoUser ? DEMO_DATE_EARNINGS : {};
  const COMPLETED_DATES = isDemoUser ? DEMO_COMPLETED_DATES : new Set<number>();
  const BOOKED_DATES = isDemoUser ? DEMO_BOOKED_DATES : new Set<number>();

  const WEEKLY_DATA = CURRENT_WEEK_MAP.map(({ day, label, date }) => {
    const entry = DATE_EARNINGS[date];
    return {
      day,
      label,
      amount: entry?.total ?? 0,
      jobs: entry?.jobs.length ?? 0,
    };
  });

  function weekTotal(startDate: number, endDate: number) {
    let amount = 0;
    let jobs = 0;
    for (let d = startDate; d <= endDate; d++) {
      const entry = DATE_EARNINGS[d];
      if (entry) {
        amount += entry.total;
        jobs += entry.jobs.length;
      }
    }
    return { amount, jobs };
  }
  
  const w1 = weekTotal(1, 4);
  const w2 = weekTotal(5, 11);
  const w3 = weekTotal(12, 18);
  const w4 = weekTotal(19, 25);

  const MONTHLY_DATA = [
    { day: "W1", label: "Wk1", amount: w1.amount, jobs: w1.jobs },
    { day: "W2", label: "Wk2", amount: w2.amount, jobs: w2.jobs },
    { day: "W3", label: "Wk3", amount: w3.amount, jobs: w3.jobs },
    { day: "W4", label: "Wk4", amount: w4.amount, jobs: w4.jobs },
  ];

  const data = mode === "weekly" ? WEEKLY_DATA : MONTHLY_DATA;
  const maxAmount = Math.max(...data.map((d) => d.amount));
  const selectedBar = barSelected !== null ? data[barSelected] : null;
  const dayData = calDay !== null ? DATE_EARNINGS[calDay] : null;

  const totalWeek = WEEKLY_DATA.reduce((s, d) => s + d.amount, 0);
  const totalWeekJobs = WEEKLY_DATA.reduce((s, d) => s + d.jobs, 0);
  const avgRating = isDemoUser ? "4.8★" : "0.0★";
  const onTime = isDemoUser ? "91%" : "0%";

  const RECENT_JOBS: DayJob[] = DATE_EARNINGS[17]?.jobs ?? [];

  return (
    <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/provider" className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-ink-muted hover:bg-stone-200 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Kamai</h1>
          <p className="text-xs text-ink-muted">Earnings & Payouts</p>
        </div>
      </div>

      {/* Hero */}
      <div className="mb-4 rounded-3xl bg-gradient-to-br from-accent-600 to-amber-700 p-5 text-white shadow-lg">
        <p className="text-accent-100 text-sm font-medium">Is hafte ki kamai</p>
        <p className="text-4xl font-bold mt-1">PKR {totalWeek.toLocaleString()}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[[String(totalWeekJobs), "Total Jobs"], [avgRating, "Avg Rating"], [onTime, "On-time"]].map(([val, lbl]) => (
            <div key={lbl} className="rounded-2xl bg-white/15 py-2.5">
              <p className="text-lg font-bold">{val}</p>
              <p className="text-[10px] text-accent-100 mt-0.5">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Toggle */}
      <div className="mb-4 flex rounded-2xl bg-stone-100 p-1">
        {(["weekly", "monthly"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setBarSelected(null); }}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${mode === m ? "bg-white text-ink shadow-sm" : "text-ink-muted"}`}>
            {m === "weekly" ? "Is Hafta" : "Is Mahina"}
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="card mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-ink">Kamai ka graph</p>
          <p className="text-xs text-ink-muted">👆 bar chhuen</p>
        </div>

        {selectedBar && (
          <div className="mb-3 rounded-2xl bg-accent-50 border border-accent-200 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-accent-700 text-lg">PKR {selectedBar.amount.toLocaleString()}</p>
              <p className="text-xs text-ink-muted">{selectedBar.jobs} job{selectedBar.jobs !== 1 ? "s" : ""} · {selectedBar.label}</p>
            </div>
            <DollarSign size={24} className="text-accent-500" />
          </div>
        )}

        <div className="flex items-end justify-around gap-1 h-40">
          {data.map((d, i) => {
            const heightPct = maxAmount > 0 ? (d.amount / maxAmount) * 100 : 0;
            const isSelected = barSelected === i;
            return (
              <button key={d.day} onClick={() => setBarSelected(i === barSelected ? null : i)}
                className="flex flex-1 flex-col items-center gap-1 group">
                <div className="w-full flex flex-col items-center justify-end" style={{ height: "120px" }}>
                  <div className={`w-full rounded-t-xl transition-all duration-300 ${
                    isSelected ? "bg-accent-500 shadow-lg shadow-accent-300/40" : "bg-accent-300/60 group-hover:bg-accent-400/80"
                  }`} style={{ height: `${heightPct}%`, minHeight: d.amount > 0 ? "8px" : "2px" }} />
                </div>
                <span className={`text-[10px] font-bold transition ${isSelected ? "text-accent-600" : "text-ink-muted"}`}>
                  {d.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Week date range label */}
        {mode === "weekly" && (
          <p className="text-center text-[10px] text-ink-faint mt-2 font-medium">
            May 12 – May 18, 2026
          </p>
        )}
      </div>

      {/* Calendar — click a date to see daily earnings */}
      <div className="card mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCalMonth("Apr 2026")}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 transition">
            <ChevronLeft size={16} />
          </button>
          <p className="font-bold text-ink">{calMonth}</p>
          <button onClick={() => setCalMonth("Jun 2026")}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 transition">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {CALENDAR_DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-ink-muted py-1">{d}</div>
          ))}
        </div>

        {/* Date grid */}
        {CALENDAR_DATES.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((date, di) => {
              if (!date) return <div key={di} />;
              const isSelected = calDay === date;
              const isToday = date === 17;
              const isDone = COMPLETED_DATES.has(date);
              const isBooked = BOOKED_DATES.has(date);
              const hasEarnings = !!DATE_EARNINGS[date];

              return (
                <button key={di} onClick={() => setCalDay(date === calDay ? null : date)}
                  className={`relative aspect-square rounded-xl text-[11px] font-bold flex flex-col items-center justify-center transition
                    ${isSelected
                      ? "bg-accent-500 text-white shadow-md ring-2 ring-accent-300"
                      : isToday
                      ? "ring-2 ring-accent-400 text-accent-700 bg-accent-50"
                      : isBooked
                      ? "bg-brand-100 text-brand-700 hover:bg-brand-200"
                      : isDone
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "text-ink hover:bg-stone-100"
                    }`}
                >
                  {date}
                  {/* Earnings dot indicator */}
                  {hasEarnings && !isSelected && (
                    <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-accent-500" />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3 justify-center text-[10px] font-semibold">
          {[
            { color: "bg-accent-500", label: "Selected" },
            { color: "bg-green-300",  label: "Done" },
            { color: "bg-brand-300",  label: "Scheduled" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${l.color}`} />{l.label}
            </span>
          ))}
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-accent-500 opacity-70" />Earnings (dot)
          </span>
        </div>

        {/* ── Day detail panel (shown when a date is tapped) ── */}
        {calDay !== null && (
          <div className="mt-4 rounded-2xl border border-accent-200 bg-accent-50 overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 bg-accent-100">
              <div>
                <p className="font-bold text-accent-700">May {calDay}, 2026</p>
                {dayData ? (
                  <p className="text-xs text-accent-600 font-semibold">
                    PKR {dayData.total.toLocaleString()} · {dayData.jobs.length} job{dayData.jobs.length !== 1 ? "s" : ""}
                  </p>
                ) : (
                  <p className="text-xs text-ink-muted">Koi kaam nahi tha</p>
                )}
              </div>
              <button onClick={() => setCalDay(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-ink-muted hover:bg-white transition">
                <X size={14} />
              </button>
            </div>

            {/* Jobs list */}
            {dayData ? (
              <div className="divide-y divide-accent-100">
                {dayData.jobs.map((job, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-accent-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink text-sm truncate">{job.service}</p>
                      <p className="text-xs text-ink-muted">{job.customer} · {job.area}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {Array.from({ length: job.rating }).map((_, ri) => (
                          <Star key={ri} size={10} className="text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="font-bold text-accent-700 text-sm shrink-0">
                      +{job.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
                {/* Day total */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/60">
                  <p className="font-bold text-ink text-sm">Kul kamai</p>
                  <p className="font-bold text-accent-600 text-lg">PKR {dayData.total.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-ink-faint">
                <Clock size={28} className="mb-2 opacity-40" />
                <p className="text-sm">Is din koi job nahi thi</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Jobs */}
      {RECENT_JOBS.length > 0 ? (
        <div className="card p-4">
          <p className="text-sm font-bold text-ink mb-3">Recent Jobs</p>
          <div className="space-y-3">
            {RECENT_JOBS.map((job, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-sm truncate">{job.service}</p>
                  <p className="text-xs text-ink-muted">{job.customer} · {job.area}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {Array.from({ length: job.rating }).map((_, ri) => (
                      <Star key={ri} size={10} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="font-bold text-accent-700 text-sm shrink-0">+{job.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-6 flex flex-col items-center justify-center text-ink-muted">
          <p className="text-sm font-semibold">No recent jobs</p>
          <p className="text-xs mt-1">Start taking jobs to see your earnings.</p>
        </div>
      )}
    </main>
  );
}
