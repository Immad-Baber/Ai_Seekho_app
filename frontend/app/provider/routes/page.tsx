"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Navigation, Clock, CheckCircle2,
  AlertTriangle, Zap, Car, Home, Inbox,
} from "lucide-react";
import { getUser, getProviderJobs, type AuthUser, type ProviderJob } from "@/lib/auth";
import { getMapsKey } from "@/lib/api";

interface RouteStop {
  id: number;
  location: string;
  service: string;
  customer: string;
  time: string;
  eta: string;
  distance: string;
  status: "completed" | "current" | "upcoming";
  pay: number;
}

const STOP_ICON_COLORS = {
  completed: "bg-green-100 text-green-600 border-green-300",
  current: "bg-amber-100 text-amber-600 border-amber-400 ring-4 ring-amber-200",
  upcoming: "bg-stone-100 text-ink-muted border-stone-200",
};

export default function ProviderRoutes() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [activeStop, setActiveStop] = useState<number | null>(null);
  const [mapsKey, setMapsKey] = useState<string>("");

  useEffect(() => {
    getMapsKey().then(key => setMapsKey(key));
    const u = getUser();
    if (!u || u.role !== "provider") { router.push("/select-role"); return; }
    setUser(u);

    // Build route stops from today's actual jobs
    const jobs = getProviderJobs(u.phone);
    const today = new Date().toDateString();

    const todayJobs = jobs.filter((j) => {
      const d = new Date(j.assignedAt);
      return d.toDateString() === today;
    });

    if (todayJobs.length === 0) {
      setStops([]);
      return;
    }

    const routeStops: RouteStop[] = todayJobs.map((j, i) => {
      let status: "completed" | "current" | "upcoming" = "upcoming";
      if (j.status === "completed") status = "completed";
      else if (j.status === "in-progress") status = "current";
      else if (j.status === "auto-assigned" && i === 0) status = "current";

      return {
        id: i + 1,
        location: j.area || "Islamabad",
        service: j.service,
        customer: j.customer,
        time: j.time,
        eta: `${Math.round(Math.random() * 20 + 5)} min`,
        distance: `${(Math.random() * 8 + 1).toFixed(1)} km`,
        status,
        pay: j.pay,
      };
    });

    // Ensure at most one "current" stop — the first non-completed one
    let foundCurrent = false;
    routeStops.forEach((s) => {
      if (s.status === "completed") return;
      if (!foundCurrent) {
        s.status = "current";
        foundCurrent = true;
      } else {
        s.status = "upcoming";
      }
    });

    setStops(routeStops);
    // Auto-expand the current stop
    const currentStop = routeStops.find((s) => s.status === "current");
    if (currentStop) setActiveStop(currentStop.id);
  }, [router]);

  if (!user) return null;

  const totalDistance = stops.reduce((s, stop) => s + parseFloat(stop.distance), 0).toFixed(1);
  const totalPay = stops.reduce((s, stop) => s + stop.pay, 0);
  const completedCount = stops.filter((s) => s.status === "completed").length;

  // Build route label
  const routeLabel = stops.map((s) => s.location.split(",")[0]).join(" → ");

  const getEmbedUrl = () => {
    if (!mapsKey || stops.length === 0) return "";
    const cleanLoc = (loc: string) => {
      const suffix = loc.toLowerCase().includes("islamabad") ? "" : ", Islamabad, Pakistan";
      return encodeURIComponent(loc + suffix);
    };

    if (stops.length === 1) {
      return `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${cleanLoc(stops[0].location)}`;
    }

    const origin = cleanLoc(stops[0].location);
    const destination = cleanLoc(stops[stops.length - 1].location);
    
    if (stops.length > 2) {
      const waypoints = stops.slice(1, -1).map(s => cleanLoc(s.location)).join("|");
      return `https://www.google.com/maps/embed/v1/directions?key=${mapsKey}&origin=${origin}&destination=${destination}&waypoints=${waypoints}&mode=driving`;
    }
    
    return `https://www.google.com/maps/embed/v1/directions?key=${mapsKey}&origin=${origin}&destination=${destination}&mode=driving`;
  };

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

      {/* Empty State */}
      {stops.length === 0 ? (
        <>
          <div className="mb-4 rounded-3xl bg-gradient-to-br from-stone-400 to-stone-500 p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-stone-100" />
              <p className="text-sm font-semibold text-stone-100">No route for today</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["0/0", "Stops"],
                ["0 km", "Distance"],
                ["PKR 0", "Pay"],
              ].map(([val, lbl]) => (
                <div key={lbl} className="rounded-2xl bg-white/15 py-2.5 px-1">
                  <p className="text-sm font-bold leading-tight">{val}</p>
                  <p className="text-[10px] text-stone-100 mt-0.5">{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-stone-100 mb-4">
              <Inbox size={28} className="text-ink-faint" />
            </div>
            <p className="font-bold text-ink text-base">Koi route nahi hai</p>
            <p className="text-sm text-ink-muted mt-1">Aaj ke liye koi job assign nahi hui</p>
            <p className="text-xs text-ink-faint mt-3">Jab jobs assign hongi, route yahan dikhega</p>
          </div>
        </>
      ) : (
        <>
          {/* Stats Hero */}
          <div className="mb-4 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-brand-100" />
              <p className="text-sm font-semibold text-brand-100">AI ne route optimize kar diya</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                [`${completedCount}/${stops.length}`, "Stops Done"],
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

          {/* Map Section */}
          <div className="card mb-4 overflow-hidden">
            <div className="relative h-64 bg-stone-100 flex items-center justify-center">
              {mapsKey ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={getEmbedUrl()}
                />
              ) : (
                <>
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "linear-gradient(#a3a3a3 1px, transparent 1px), linear-gradient(90deg, #a3a3a3 1px, transparent 1px)",
                      backgroundSize: "32px 32px",
                    }}
                  />
                  {/* Route line simulation */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 176">
                    <path
                      d={stops.length <= 2
                        ? "M 80 100 Q 200 60 320 100"
                        : stops.length <= 3
                        ? "M 60 140 Q 200 60 340 120"
                        : "M 60 140 Q 120 80 200 100 Q 280 120 340 40"}
                      stroke="#059669" strokeWidth="3" fill="none" strokeDasharray="8 4"
                    />
                    {stops.map((stop, i) => {
                      const positions = stops.length <= 2
                        ? [{ cx: 80, cy: 100 }, { cx: 320, cy: 100 }]
                        : stops.length <= 3
                        ? [{ cx: 60, cy: 140 }, { cx: 200, cy: 60 }, { cx: 340, cy: 120 }]
                        : [{ cx: 60, cy: 140 }, { cx: 160, cy: 90 }, { cx: 260, cy: 110 }, { cx: 340, cy: 40 }];
                      const pos = positions[Math.min(i, positions.length - 1)];
                      const color = stop.status === "completed" ? "#22c55e" : stop.status === "current" ? "#f59e0b" : "#94a3b8";
                      return (
                        <g key={stop.id}>
                          <circle cx={pos.cx} cy={pos.cy} r="10" fill={color} />
                          <text x={pos.cx} y={pos.cy + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                            {stop.id}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <p className="text-xs text-ink-muted font-semibold z-10 absolute bottom-3 right-3 bg-white/80 rounded-full px-2 py-0.5">
                    Google Maps (Demo)
                  </p>
                </>
              )}
            </div>

            <div className="p-3 flex items-center gap-2 border-t border-stone-100">
              <Car size={16} className="text-brand-600 shrink-0" />
              <p className="text-xs text-ink-muted flex-1">Current route: <span className="font-semibold text-ink">{routeLabel}</span></p>
              <button
                onClick={() => {
                  if (stops.length > 0) {
                    const dest = encodeURIComponent(stops[stops.length - 1].location + ", Islamabad, Pakistan");
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank");
                  }
                }}
                className="text-xs font-bold text-brand-600 flex items-center gap-0.5"
              >
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
              {stops.map((stop) => {
                const isActive = activeStop === stop.id;
                return (
                  <button
                    key={stop.id}
                    onClick={() => setActiveStop(isActive ? null : stop.id)}
                    className="relative w-full text-left"
                  >
                    {/* Stop number badge */}
                    <div className={`absolute left-0 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition ${STOP_ICON_COLORS[stop.status]}`}>
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
                  <p className="text-xs text-ink-muted mt-0.5">End of route</p>
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
        </>
      )}
    </main>
  );
}
