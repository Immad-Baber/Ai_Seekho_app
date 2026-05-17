"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Zap, ZapOff, Clock, MapPin,
  Plus, Trash2, CheckCircle2, Moon,
} from "lucide-react";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WorkBlock {
  id: string;
  start: string;
  end: string;
}

const DEFAULT_SCHEDULE: Record<string, WorkBlock[]> = {
  Mon: [{ id: "m1", start: "09:00", end: "17:00" }],
  Tue: [{ id: "t1", start: "09:00", end: "17:00" }],
  Wed: [{ id: "w1", start: "09:00", end: "17:00" }],
  Thu: [{ id: "th1", start: "09:00", end: "17:00" }],
  Fri: [{ id: "f1", start: "09:00", end: "13:00" }],
  Sat: [],
  Sun: [],
};

const SERVICE_AREAS = [
  { area: "G-13", active: true },
  { area: "G-10", active: true },
  { area: "F-8", active: true },
  { area: "F-7", active: false },
  { area: "I-8", active: false },
  { area: "Bahria", active: false },
];

export default function ProviderAvailability() {
  const [online, setOnline] = useState(true);
  const [maxJobs, setMaxJobs] = useState(4);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [areas, setAreas] = useState(SERVICE_AREAS);
  const [breakMode, setBreakMode] = useState(false);

  const toggleDay = (day: string) => {
    setSchedule((prev) => {
      const has = prev[day].length > 0;
      return {
        ...prev,
        [day]: has ? [] : [{ id: `${day}-new`, start: "09:00", end: "17:00" }],
      };
    });
  };

  const toggleArea = (idx: number) => {
    setAreas((prev) => prev.map((a, i) => i === idx ? { ...a, active: !a.active } : a));
  };

  const activeAreaCount = areas.filter((a) => a.active).length;
  const activeDayCount = Object.values(schedule).filter((d) => d.length > 0).length;

  return (
    <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/provider" className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-ink-muted hover:bg-stone-200 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Availability</h1>
          <p className="text-xs text-ink-muted">Online status aur schedule manage karein</p>
        </div>
      </div>

      {/* Online / Offline Toggle */}
      <div
        onClick={() => setOnline(!online)}
        className={`mb-4 cursor-pointer rounded-3xl p-5 transition-all shadow-lg ${
          online
            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
            : "bg-gradient-to-br from-stone-400 to-stone-500 text-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {online ? <Zap size={20} /> : <ZapOff size={20} />}
              <p className="text-xl font-bold">{online ? "Online — Available" : "Offline"}</p>
            </div>
            <p className={`text-sm ${online ? "text-green-100" : "text-stone-300"}`}>
              {online ? "AI aapko jobs assign kar raha hai" : "Koi job assign nahi hogi"}
            </p>
          </div>
          <div className={`relative h-8 w-16 rounded-full transition-colors ${online ? "bg-white/30" : "bg-black/20"}`}>
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${online ? "translate-x-9" : "translate-x-1"}`} />
          </div>
        </div>

        {online && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              [`${activeDayCount} days`, "Working days"],
              [`${maxJobs} max`, "Jobs per day"],
              [`${activeAreaCount} areas`, "Service areas"],
            ].map(([val, lbl]) => (
              <div key={lbl} className="rounded-2xl bg-white/15 py-2">
                <p className="font-bold text-sm">{val}</p>
                <p className="text-[10px] text-green-100 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Break Mode */}
      <div className={`mb-4 rounded-2xl border p-4 flex items-center gap-3 transition ${breakMode ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-white"}`}>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${breakMode ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-ink-muted"}`}>
          <Moon size={18} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-ink text-sm">Break Mode</p>
          <p className="text-xs text-ink-muted">Temporarily jobs band karein (aaj ke liye)</p>
        </div>
        <button
          onClick={() => setBreakMode(!breakMode)}
          className={`relative h-6 w-11 rounded-full transition-colors ${breakMode ? "bg-amber-500" : "bg-stone-200"}`}
        >
          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${breakMode ? "translate-x-5" : "translate-x-1"}`} />
        </button>
      </div>

      {/* Max Jobs Slider */}
      <div className="card mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-ink text-sm">Max Jobs per Day</p>
            <p className="text-xs text-ink-muted">AI isse zyada jobs assign nahi karega</p>
          </div>
          <span className="text-2xl font-bold text-brand-600">{maxJobs}</span>
        </div>
        <input
          type="range" min={1} max={8} value={maxJobs}
          onChange={(e) => setMaxJobs(Number(e.target.value))}
          className="w-full accent-brand-600"
        />
        <div className="flex justify-between text-[10px] text-ink-faint font-semibold mt-1">
          <span>1 (Aaram)</span>
          <span>4 (Normal)</span>
          <span>8 (Full)</span>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="card mb-4 p-4">
        <p className="text-sm font-bold text-ink mb-3">Weekly Schedule</p>
        <div className="space-y-2">
          {DAYS_OF_WEEK.map((day) => {
            const hasSlots = schedule[day].length > 0;
            return (
              <div key={day} className={`flex items-center gap-3 rounded-xl border p-3 transition ${hasSlots ? "border-brand-200 bg-brand-50" : "border-stone-100 bg-stone-50"}`}>
                <button
                  onClick={() => toggleDay(day)}
                  className={`relative h-5 w-9 rounded-full transition-colors shrink-0 ${hasSlots ? "bg-brand-500" : "bg-stone-200"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${hasSlots ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <p className={`w-8 text-xs font-bold ${hasSlots ? "text-brand-700" : "text-ink-muted"}`}>{day}</p>
                {hasSlots ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <Clock size={12} className="text-brand-500" />
                    <span className="text-xs font-semibold text-brand-700">
                      {schedule[day][0].start} — {schedule[day][0].end}
                    </span>
                  </div>
                ) : (
                  <span className="flex-1 text-xs text-ink-faint">Day Off</span>
                )}
                {hasSlots && (
                  <CheckCircle2 size={14} className="text-brand-500 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Service Areas */}
      <div className="card mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-ink">Service Areas</p>
            <p className="text-xs text-ink-muted">Jinme aap kaam karte hain</p>
          </div>
          <span className="text-xs font-bold rounded-full bg-brand-100 text-brand-700 px-2 py-0.5">
            {activeAreaCount} active
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {areas.map((a, i) => (
            <button
              key={a.area}
              onClick={() => toggleArea(i)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                a.active
                  ? "border-brand-400 bg-brand-100 text-brand-700"
                  : "border-stone-200 bg-stone-50 text-ink-muted hover:border-brand-300"
              }`}
            >
              <MapPin size={10} />
              {a.area}
              {a.active && <CheckCircle2 size={10} />}
            </button>
          ))}
          <button className="flex items-center gap-1 rounded-full border border-dashed border-stone-300 px-3 py-1.5 text-xs font-bold text-ink-muted hover:border-brand-400 transition">
            <Plus size={12} /> Add area
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button className="btn-primary w-full py-3.5 text-base">
        <CheckCircle2 size={18} /> Save Changes
      </button>
    </main>
  );
}
