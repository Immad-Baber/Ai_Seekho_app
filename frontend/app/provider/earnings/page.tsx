"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, getProviderJobs, getProviderStats, type AuthUser, type ProviderJob } from "@/lib/auth";
import {
  ArrowLeft, DollarSign, ChevronLeft, ChevronRight,
  Star, Clock, CheckCircle2, X, Inbox,
} from "lucide-react";

// ─── Calendar Helpers ────────────────────────────────────────────────────────

const CALENDAR_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (number | null)[][] = [];
  let week: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) week.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) { grid.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    grid.push(week);
  }
  return grid;
}

interface DayEarning {
  total: number;
  jobs: { service: string; customer: string; area: string; amount: number; rating: number }[];
}

export default function ProviderEarnings() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [allJobs, setAllJobs] = useState<ProviderJob[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getProviderStats> | null>(null);

  const now = new Date();
  const [mode, setMode] = useState<"weekly" | "monthly">("weekly");
  const [barSelected, setBarSelected] = useState<number | null>(null);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calDay, setCalDay] = useState<number | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "provider") { router.push("/select-role"); return; }
    setUser(u);
    setAllJobs(getProviderJobs(u.phone));
    setStats(getProviderStats(u.phone));
  }, [router]);

  // Build per-date earnings from actual jobs
  const dateEarnings = useMemo(() => {
    const map: Record<string, DayEarning> = {};
    allJobs.filter((j) => j.status === "completed").forEach((j) => {
      const d = new Date(j.assignedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = { total: 0, jobs: [] };
      map[key].total += j.pay;
      map[key].jobs.push({
        service: j.service,
        customer: j.customer,
        area: j.area,
        amount: j.pay,
        rating: 5,
      });
    });
    return map;
  }, [allJobs]);

  // Current week data
  const getWeekData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const entry = dateEarnings[key];
      return {
        day: label,
        label,
        amount: entry?.total ?? 0,
        jobs: entry?.jobs.length ?? 0,
      };
    });
  };

  // Monthly data (4 weeks)
  const getMonthData = () => {
    const weeks = [
      { label: "Wk1", start: 1, end: 7 },
      { label: "Wk2", start: 8, end: 14 },
      { label: "Wk3", start: 15, end: 21 },
      { label: "Wk4", start: 22, end: 31 },
    ];
    return weeks.map((w) => {
      let amount = 0;
      let jobs = 0;
      for (let d = w.start; d <= w.end; d++) {
        const key = `${calYear}-${calMonth}-${d}`;
        const entry = dateEarnings[key];
        if (entry) {
          amount += entry.total;
          jobs += entry.jobs.length;
        }
      }
      return { day: w.label, label: w.label, amount, jobs };
    });
  };

  const WEEKLY_DATA = getWeekData();
  const MONTHLY_DATA = getMonthData();
  const data = mode === "weekly" ? WEEKLY_DATA : MONTHLY_DATA;
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  const selectedBar = barSelected !== null ? data[barSelected] : null;

  const calendarGrid = useMemo(() => getCalendarGrid(calYear, calMonth), [calYear, calMonth]);
  const calMonthLabel = `${MONTH_NAMES[calMonth]} ${calYear}`;

  // Get day earnings for calendar
  const getDayEarning = (date: number): DayEarning | null => {
    const key = `${calYear}-${calMonth}-${date}`;
    return dateEarnings[key] || null;
  };

  const dayData = calDay !== null ? getDayEarning(calDay) : null;

  const totalWeek = WEEKLY_DATA.reduce((s, d) => s + d.amount, 0);
  const totalWeekJobs = WEEKLY_DATA.reduce((s, d) => s + d.jobs, 0);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
    setCalDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
    setCalDay(null);
  };

  if (!user || !stats) return null;

  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();

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
          {[
            [String(totalWeekJobs), "Total Jobs"],
            [stats.totalReviews > 0 ? `${stats.avgRating}★` : "—", "Avg Rating"],
            [stats.completedJobs > 0 ? stats.onTimeRate : "—", "On-time"],
          ].map(([val, lbl]) => (
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
      </div>

      {/* Calendar */}
      <div className="card mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 transition">
            <ChevronLeft size={16} />
          </button>
          <p className="font-bold text-ink">{calMonthLabel}</p>
          <button onClick={nextMonth}
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
        {calendarGrid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((date, di) => {
              if (!date) return <div key={di} />;
              const isSelected = calDay === date;
              const isToday = isCurrentMonth && date === now.getDate();
              const earning = getDayEarning(date);
              const hasEarnings = !!earning;

              return (
                <button key={di} onClick={() => setCalDay(date === calDay ? null : date)}
                  className={`relative aspect-square rounded-xl text-[11px] font-bold flex flex-col items-center justify-center transition
                    ${isSelected
                      ? "bg-accent-500 text-white shadow-md ring-2 ring-accent-300"
                      : isToday
                      ? "ring-2 ring-accent-400 text-accent-700 bg-accent-50"
                      : hasEarnings
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "text-ink hover:bg-stone-100"
                    }`}
                >
                  {date}
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
            { color: "bg-green-300",  label: "Earned" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${l.color}`} />{l.label}
            </span>
          ))}
        </div>

        {/* Day detail panel */}
        {calDay !== null && (
          <div className="mt-4 rounded-2xl border border-accent-200 bg-accent-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-accent-100">
              <div>
                <p className="font-bold text-accent-700">{MONTH_NAMES[calMonth]} {calDay}, {calYear}</p>
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

      {/* No earnings state */}
      {allJobs.filter((j) => j.status === "completed").length === 0 && (
        <div className="card p-6 flex flex-col items-center justify-center text-ink-muted">
          <Inbox size={28} className="mb-2 opacity-40" />
          <p className="text-sm font-semibold">No earnings yet</p>
          <p className="text-xs mt-1">Start completing jobs to see your earnings.</p>
        </div>
      )}
    </main>
  );
}
