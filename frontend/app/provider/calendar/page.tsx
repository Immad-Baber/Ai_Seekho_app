"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, XCircle, Plus, Zap,
} from "lucide-react";
import { getUser, getProviderJobs, type AuthUser, type ProviderJob } from "@/lib/auth";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type SlotStatus = "booked" | "open" | "blocked" | "completed";

interface TimeSlot {
  time: string;
  status: SlotStatus;
  service?: string;
  customer?: string;
  pay?: number;
}

// Generate calendar grid for any month/year
function getCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const grid: (number | null)[][] = [];
  let week: (number | null)[] = [];

  // Fill initial empty cells
  for (let i = 0; i < firstDay; i++) {
    week.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }

  // Fill trailing empty cells
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    grid.push(week);
  }

  return grid;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_STYLE: Record<SlotStatus, string> = {
  booked:    "bg-brand-50 border-brand-200 text-brand-700",
  open:      "bg-green-50 border-green-200 text-green-700",
  blocked:   "bg-red-50 border-red-200 text-red-500",
  completed: "bg-stone-50 border-stone-200 text-ink-muted",
};
const STATUS_ICON: Record<SlotStatus, React.ElementType> = {
  booked:    Clock,
  open:      Plus,
  blocked:   XCircle,
  completed: CheckCircle2,
};
const STATUS_LABEL: Record<SlotStatus, string> = {
  booked:    "Scheduled",
  open:      "Available",
  blocked:   "Blocked",
  completed: "Done",
};

export default function ProviderCalendar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [jobs, setJobs] = useState<ProviderJob[]>([]);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "provider") { router.push("/select-role"); return; }
    setUser(u);
    setJobs(getProviderJobs(u.phone));
  }, [router]);

  const calendarGrid = useMemo(() => getCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  // Build per-day data from jobs
  const dayJobMap = useMemo(() => {
    const map: Record<number, ProviderJob[]> = {};
    jobs.forEach((j) => {
      const d = new Date(j.assignedAt);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(j);
      }
    });
    return map;
  }, [jobs, viewYear, viewMonth]);

  // Generate time slots for selected day from actual jobs
  const slots: TimeSlot[] = useMemo(() => {
    if (!selectedDay) return [];
    const dayJobs = dayJobMap[selectedDay] || [];

    if (dayJobs.length === 0) {
      // No jobs — show open slots
      return [
        { time: "09:00 AM", status: "open" },
        { time: "11:00 AM", status: "open" },
        { time: "02:00 PM", status: "open" },
        { time: "04:00 PM", status: "open" },
      ];
    }

    return dayJobs.map((j) => ({
      time: j.time,
      status: j.status === "completed" ? "completed" as const
        : j.status === "cancelled" ? "blocked" as const
        : "booked" as const,
      service: j.service,
      customer: j.customer,
      pay: j.pay,
    }));
  }, [selectedDay, dayJobMap]);

  const openCount = slots.filter((s) => s.status === "open").length;
  const bookedCount = slots.filter((s) => s.status === "booked" || s.status === "completed").length;

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDay(null);
  };

  const today = now.getDate();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  return (
    <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/provider" className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-ink-muted hover:bg-stone-200 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Schedule Calendar</h1>
          <p className="text-xs text-ink-muted">Apna schedule manage karein</p>
        </div>
      </div>

      {/* AI Banner */}
      <div className="mb-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Zap size={18} />
        </div>
        <div>
          <p className="font-bold text-sm">AI Scheduling Active</p>
          <p className="text-xs text-brand-100">Jobs automatically assign ho jaate hain available slots mein</p>
        </div>
      </div>

      {/* Month Calendar */}
      <div className="card mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 transition">
            <ChevronLeft size={16} />
          </button>
          <p className="font-bold text-ink">{monthLabel}</p>
          <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 transition">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-ink-muted py-1">{d}</div>
          ))}
        </div>

        {/* Date grid */}
        {calendarGrid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((date, di) => {
              if (!date) return <div key={di} />;
              const isSelected = selectedDay === date;
              const isToday = isCurrentMonth && date === today;
              const hasJobs = !!dayJobMap[date];
              const dayJobs = dayJobMap[date] || [];
              const hasCompleted = dayJobs.some((j) => j.status === "completed");
              const hasBooked = dayJobs.some((j) => j.status === "auto-assigned" || j.status === "in-progress");

              return (
                <button
                  key={di}
                  onClick={() => setSelectedDay(date === selectedDay ? null : date)}
                  className={`relative aspect-square rounded-xl text-xs font-bold flex flex-col items-center justify-center transition
                    ${isSelected
                      ? "bg-brand-600 text-white shadow-md"
                      : isToday
                      ? "ring-2 ring-brand-400 text-brand-700 bg-brand-50"
                      : hasBooked
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : hasCompleted
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "text-ink hover:bg-stone-100"
                    }`}
                >
                  {date}
                  {hasJobs && !isSelected && (
                    <span className={`absolute bottom-1 h-1 w-1 rounded-full ${hasBooked ? "bg-amber-500" : "bg-green-500"}`} />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3 justify-center text-[10px] font-semibold">
          {[
            { color: "bg-brand-500", label: "Selected" },
            { color: "bg-amber-300", label: "Scheduled" },
            { color: "bg-green-300", label: "Completed" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Day Detail */}
      {selectedDay && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-ink">{MONTH_NAMES[viewMonth]} {selectedDay} — Time Slots</p>
            <div className="flex gap-2">
              <span className="text-[11px] font-bold rounded-full bg-green-100 text-green-700 px-2 py-0.5">{openCount} Open</span>
              <span className="text-[11px] font-bold rounded-full bg-brand-100 text-brand-700 px-2 py-0.5">{bookedCount} Booked</span>
            </div>
          </div>

          <div className="space-y-2">
            {slots.map((slot, i) => {
              const Icon = STATUS_ICON[slot.status];
              return (
                <div key={i} className={`flex items-center gap-3 rounded-2xl border p-3.5 ${STATUS_STYLE[slot.status]}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/60">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{slot.time}</p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/70">
                        {STATUS_LABEL[slot.status]}
                      </span>
                    </div>
                    {slot.service && (
                      <p className="text-xs mt-0.5 opacity-80">
                        {slot.service} · {slot.customer}
                      </p>
                    )}
                  </div>
                  {slot.pay && (
                    <p className="font-bold text-sm shrink-0">PKR {slot.pay.toLocaleString()}</p>
                  )}
                  {slot.status === "open" && (
                    <button className="shrink-0 rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 transition">
                      Block
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
