"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft, MapPin, Navigation, Clock, CheckCircle2,
  AlertTriangle, Zap, ChevronRight, Car, Home, Briefcase,
} from "lucide-react";

const STOPS = [
  {
    id: 1,
    location: "G-13/2, Islamabad",
    service: "AC Gas Refill",
    customer: "Ali Khan",
    time: "10:00 AM",
    eta: "8 min",
    distance: "2.3 km",
    status: "completed",
    pay: 4500,
  },
  {
    id: 2,
    location: "G-10/4, Islamabad",
    service: "Geyser Leak Repair",
    customer: "Fatima Malik",
    time: "11:30 AM",
    eta: "12 min",
    distance: "4.1 km",
    status: "current",
    pay: 2800,
  },
  {
    id: 3,
    location: "F-8/3, Islamabad",
    service: "Fan Wiring & Install",
    customer: "Ahmed Raza",
    time: "2:00 PM",
    eta: "28 min",
    distance: "7.8 km",
    status: "upcoming",
    pay: 2600,
  },
  {
    id: 4,
    location: "F-7/2, Islamabad",
    service: "Airport Drop",
    customer: "Sara Iqbal",
    time: "6:30 AM",
    eta: "35 min",
    distance: "9.4 km",
    status: "upcoming",
    pay: 1800,
  },
];

const ROUTE_LINE_COLORS = {
  completed: "bg-green-400",
  current: "bg-amber-400 animate-pulse",
  upcoming: "bg-stone-300",
};

const STOP_ICON_COLORS = {
  completed: "bg-green-100 text-green-600 border-green-300",
  current: "bg-amber-100 text-amber-600 border-amber-400 ring-4 ring-amber-200",
  upcoming: "bg-stone-100 text-ink-muted border-stone-200",
};

export default function ProviderRoutes() {
  const [activeStop, setActiveStop] = useState<number | null>(2);
  const totalDistance = STOPS.reduce((s, stop) => s + parseFloat(stop.distance), 0).toFixed(1);
  const totalPay = STOPS.reduce((s, stop) => s + stop.pay, 0);
  const completedCount = STOPS.filter((s) => s.status === "completed").length;

  return (
    <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/provider" className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-ink-muted hover:bg-stone-200 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Route Optimization</h1>
          <p className="text-xs text-ink-muted">AI-optimized stops · Google Maps powered</p>
        </div>
      </div>

      {/* Stats Hero */}
      <div className="mb-4 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-brand-100" />
          <p className="text-sm font-semibold text-brand-100">AI ne route optimize kar diya</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            [`${completedCount}/${STOPS.length}`, "Stops Done"],
            [`${totalDistance} km`, "Total Distance"],
            [`PKR ${totalPay.toLocaleString()}`, "Total Pay"],
          ].map(([val, lbl]) => (
            <div key={lbl} className="rounded-2xl bg-white/15 py-2.5 px-1">
              <p className="text-sm font-bold leading-tight">{val}</p>
              <p className="text-[10px] text-brand-100 mt-0.5">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="card mb-4 overflow-hidden">
        <div className="relative h-44 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
          {/* Simulated map grid */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "linear-gradient(#a3a3a3 1px, transparent 1px), linear-gradient(90deg, #a3a3a3 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Route line simulation */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 176">
            <path d="M 60 140 Q 120 80 200 100 Q 280 120 340 40" stroke="#059669" strokeWidth="3" fill="none" strokeDasharray="8 4" />
            {/* Stop pins */}
            {[
              { cx: 60, cy: 140, color: "#22c55e", label: "1" },
              { cx: 200, cy: 100, color: "#f59e0b", label: "2" },
              { cx: 280, cy: 118, color: "#94a3b8", label: "3" },
              { cx: 340, cy: 40, color: "#94a3b8", label: "4" },
            ].map((pin) => (
              <g key={pin.label}>
                <circle cx={pin.cx} cy={pin.cy} r="10" fill={pin.color} />
                <text x={pin.cx} y={pin.cy + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                  {pin.label}
                </text>
              </g>
            ))}
            {/* Current location car icon area */}
            <circle cx={180} cy={107} r="6" fill="#f59e0b" opacity="0.7" className="animate-ping" />
          </svg>
          <p className="text-xs text-ink-muted font-semibold z-10 absolute bottom-3 right-3 bg-white/80 rounded-full px-2 py-0.5">
            Google Maps (Demo)
          </p>
        </div>

        <div className="p-3 flex items-center gap-2 border-t border-stone-100">
          <Car size={16} className="text-brand-600 shrink-0" />
          <p className="text-xs text-ink-muted flex-1">Current route: <span className="font-semibold text-ink">G-13 → G-10 → F-8 → F-7</span></p>
          <button className="text-xs font-bold text-brand-600 flex items-center gap-0.5">
            Navigate <Navigation size={12} />
          </button>
        </div>
      </div>

      {/* Stops List */}
      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-3">Aaj ke stops</p>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-stone-200" />

        <div className="space-y-3">
          {STOPS.map((stop, i) => {
            const isActive = activeStop === stop.id;
            return (
              <button
                key={stop.id}
                onClick={() => setActiveStop(isActive ? null : stop.id)}
                className="relative w-full text-left"
              >
                {/* Stop number badge */}
                <div className={`absolute left-0 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition ${STOP_ICON_COLORS[stop.status as keyof typeof STOP_ICON_COLORS]}`}>
                  {stop.status === "completed" ? <CheckCircle2 size={18} /> : stop.id}
                </div>

                <div className={`ml-14 rounded-2xl border p-4 transition ${
                  isActive
                    ? stop.status === "current"
                      ? "border-amber-300 bg-amber-50"
                      : "border-brand-300 bg-brand-50"
                    : "border-stone-200 bg-white"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          stop.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : stop.status === "current"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-stone-100 text-ink-muted"
                        }`}>
                          {stop.status === "completed" ? "✅ Done" : stop.status === "current" ? "📍 Current" : "⏳ Upcoming"}
                        </span>
                        <span className="text-[10px] text-ink-faint flex items-center gap-0.5">
                          <Clock size={9} /> {stop.time}
                        </span>
                      </div>
                      <p className="font-semibold text-ink text-sm mt-1.5">{stop.service}</p>
                      <p className="text-xs text-ink-muted">{stop.customer}</p>
                      <div className="mt-2 flex gap-3 text-xs text-ink-muted">
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {stop.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-accent-700 text-sm">PKR {stop.pay.toLocaleString()}</p>
                      <p className="text-[10px] text-ink-muted mt-0.5">{stop.distance}</p>
                      <p className="text-[10px] text-brand-600 font-semibold">ETA {stop.eta}</p>
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-stone-100 flex gap-2">
                      <button className="flex-1 rounded-xl bg-brand-600 py-2 text-xs font-bold text-white flex items-center justify-center gap-1.5 hover:bg-brand-700 transition">
                        <Navigation size={13} /> Navigate
                      </button>
                      <button className="flex-1 rounded-xl border border-stone-200 py-2 text-xs font-semibold text-ink-muted flex items-center justify-center gap-1.5 hover:bg-stone-50 transition">
                        <AlertTriangle size={13} /> Report Issue
                      </button>
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Home */}
          <div className="relative">
            <div className="absolute left-0 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-brand-600">
              <Home size={18} />
            </div>
            <div className="ml-14 rounded-2xl border border-brand-100 bg-brand-50 p-4">
              <p className="font-semibold text-brand-700 text-sm">Ghar wapsi</p>
              <p className="text-xs text-ink-muted mt-0.5">End of route · ~8:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="mt-5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white flex items-center justify-between">
        <div>
          <p className="font-bold text-sm">Optimize route again?</p>
          <p className="text-xs text-brand-100 mt-0.5">AI better route dhundh sakta hai</p>
        </div>
        <button className="flex items-center gap-1 rounded-xl bg-white/20 px-3 py-2 text-xs font-bold hover:bg-white/30 transition">
          <Zap size={13} /> Optimize
        </button>
      </div>
    </main>
  );
}
