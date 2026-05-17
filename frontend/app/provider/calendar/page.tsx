"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, XCircle, Plus, Zap,
} from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// May 2026 starts on Friday (day index 5)
const MAY_DATES: (number | null)[][] = [
  [null, null, null, null, null, 1, 2],
  [3, 4, 5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14, 15, 16],
  [17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30],
  [31, null, null, null, null, null, null],
];

type SlotStatus = "booked" | "open" | "blocked" | "completed";

interface TimeSlot {
  time: string;
  status: SlotStatus;
  service?: string;
  customer?: string;
  pay?: number;
}

const DAY_SLOTS: Record<number, TimeSlot[]> = {
  17: [
    { time: "09:00 AM", status: "completed", service: "AC Gas Refill", customer: "Ali Khan", pay: 4500 },
    { time: "10:30 AM", status: "open" },
    { time: "11:30 AM", status: "completed", service: "Geyser Repair", customer: "Fatima Malik", pay: 2800 },
    { time: "01:00 PM", status: "blocked" },
    { time: "02:00 PM", status: "booked", service: "Fan Wiring", customer: "Ahmed Raza", pay: 2600 },
    { time: "04:00 PM", status: "open" },
    { time: "05:30 PM", status: "open" },
  ],
  18: [
    { time: "09:00 AM", status: "booked", service: "Deep Cleaning", customer: "Umar Farooq", pay: 3600 },
    { time: "11:00 AM", status: "open" },
    { time: "02:00 PM", status: "booked", service: "Car Repair", customer: "Bilal Ahmed", pay: 3200 },
    { time: "04:30 PM", status: "open" },
  ],
  19: [
    { time: "10:00 AM", status: "open" },
    { time: "12:00 PM", status: "open" },
    { time: "03:00 PM", status: "open" },
  ],
  20: [
    { time: "09:30 AM", status: "booked", service: "AC Service", customer: "Sara Iqbal", pay: 4000 },
    { time: "11:30 AM", status: "open" },
    { time: "02:00 PM", status: "blocked" },
  ],
  21: [
    { time: "10:00 AM", status: "open" },
    { time: "02:00 PM", status: "open" },
    { time: "05:00 PM", status: "open" },
  ],
  22: [
    { time: "09:00 AM", status: "blocked" },
    { time: "01:00 PM", status: "blocked" },
    { time: "04:00 PM", status: "open" },
  ],
};

const BOOKED_DAYS = new Set([8, 10, 13, 15, 17, 18, 20]);
const COMPLETED_DAYS = new Set([1, 2, 3, 4, 5, 6, 7, 9, 11, 12, 14, 16]);
const BLOCKED_DAYS = new Set([22]);

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
  const [selectedDay, setSelectedDay] = useState<number | null>(17);
  const [month] = useState("May 2026");

  const slots = selectedDay ? (DAY_SLOTS[selectedDay] || [
    { time: "10:00 AM", status: "open" as SlotStatus },
    { time: "02:00 PM", status: "open" as SlotStatus },
    { time: "05:00 PM", status: "open" as SlotStatus },
  ]) : [];

  const openCount = slots.filter((s) => s.status === "open").length;
  const bookedCount = slots.filter((s) => s.status === "booked" || s.status === "completed").length;

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
          <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 transition">
            <ChevronLeft size={16} />
          </button>
          <p className="font-bold text-ink">{month}</p>
          <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 transition">
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
        {MAY_DATES.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((date, di) => {
              if (!date) return <div key={di} />;
              const isSelected = selectedDay === date;
              const isToday = date === 17;
              const isBooked = BOOKED_DAYS.has(date);
              const isDone = COMPLETED_DAYS.has(date);
              const isBlocked = BLOCKED_DAYS.has(date);

              return (
                <button
                  key={di}
                  onClick={() => setSelectedDay(date === selectedDay ? null : date)}
                  className={`relative aspect-square rounded-xl text-xs font-bold flex flex-col items-center justify-center transition
                    ${isSelected
                      ? "bg-brand-600 text-white shadow-md"
                      : isToday
                      ? "ring-2 ring-brand-400 text-brand-700 bg-brand-50"
                      : isBlocked
                      ? "bg-red-100 text-red-500"
                      : isBooked
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : isDone
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "text-ink hover:bg-stone-100"
                    }`}
                >
                  {date}
                  {(isBooked || isDone) && !isSelected && (
                    <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isBooked ? "bg-amber-500" : "bg-green-500"}`} />
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
            { color: "bg-red-300", label: "Blocked" },
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
            <p className="text-sm font-bold text-ink">{month.split(" ")[0]} {selectedDay} — Time Slots</p>
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
