"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bot, CheckCircle2, Clock, MapPin,
  DollarSign, Zap, Calendar, Loader2,
} from "lucide-react";
import { getUser } from "@/lib/auth";

interface Job {
  id: string;
  service: string;
  area: string;
  time: string;
  pay: number;
  status: "auto-assigned" | "in-progress" | "completed";
  customer: string;
  assignedAt: string;
}

const DEMO_JOBS: Job[] = [
  {
    id: "J1", service: "AC gas refill", area: "G-13", time: "10:00 AM",
    pay: 4500, status: "auto-assigned", customer: "Ali Khan",
    assignedAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: "J2", service: "Geyser leak repair", area: "G-10", time: "11:30 AM",
    pay: 2800, status: "in-progress", customer: "Fatima Malik",
    assignedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "J3", service: "Fan wiring & installation", area: "F-8", time: "2:00 PM",
    pay: 2600, status: "completed", customer: "Ahmed Raza",
    assignedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: "J4", service: "Airport drop", area: "F-7", time: "6:30 AM",
    pay: 1800, status: "completed", customer: "Sara Iqbal",
    assignedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: "J5", service: "Deep cleaning (3 rooms)", area: "Bahria", time: "4:00 PM",
    pay: 3600, status: "auto-assigned", customer: "Umar Farooq",
    assignedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

const STATUS_CONFIG = {
  "auto-assigned": { label: "Auto-Assigned", color: "text-brand-700 bg-brand-50 border-brand-200", icon: Bot },
  "in-progress":   { label: "In Progress",   color: "text-amber-700 bg-amber-50 border-amber-200", icon: Loader2 },
  "completed":     { label: "Mukammal",       color: "text-green-700 bg-green-50 border-green-200", icon: CheckCircle2 },
};

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "Abhi";
  if (m < 60) return `${m} min pehle`;
  return `${Math.floor(m / 60)} ghante pehle`;
}

export default function ProviderJobs() {
  const router = useRouter();
  const [filter, setFilter] = useState<Job["status"] | "all">("all");

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "provider") router.push("/select-role");
  }, [router]);

  const filtered = filter === "all" ? DEMO_JOBS : DEMO_JOBS.filter((j) => j.status === filter);

  return (
    <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
      <Link href="/provider" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-5">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-ink">Meri Jobs</h1>
        <p className="text-sm text-ink-muted flex items-center gap-1.5 mt-0.5">
          <Bot size={14} className="text-brand-600" />
          AI ne automatically assign kiya — koi accept/reject nahi
        </p>
      </div>

      {/* AI Banner */}
      <div className="mb-5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Zap size={20} />
          </div>
          <div>
            <p className="font-bold text-sm">Autonomous Matching Active</p>
            <p className="text-xs text-brand-100 mt-0.5">
              AI aapki skill, location aur availability ke hisaab se kaam assign karta hai
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(["all", "auto-assigned", "in-progress", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
              filter === f
                ? "bg-brand-600 text-white shadow"
                : "bg-stone-100 text-ink-muted hover:bg-stone-200"
            }`}
          >
            {f === "all" ? "Sab" : STATUS_CONFIG[f].label}
            <span className="ml-1 opacity-70">
              ({f === "all" ? DEMO_JOBS.length : DEMO_JOBS.filter((j) => j.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filtered.map((j) => {
          const cfg = STATUS_CONFIG[j.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={j.id} className="card p-4">
              {/* Status Badge + Job ID */}
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${cfg.color}`}>
                  <StatusIcon size={12} />
                  {cfg.label}
                </span>
                <span className="font-mono text-[11px] text-ink-faint">#{j.id}</span>
              </div>

              {/* Service & Customer */}
              <p className="font-bold text-ink text-base">{j.service}</p>
              <p className="text-sm text-ink-muted mt-0.5">Customer: {j.customer}</p>

              {/* Details Row */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-ink-muted">
                  <MapPin size={11} /> {j.area}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-ink-muted">
                  <Calendar size={11} /> {j.time}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-ink-muted">
                  <Clock size={11} /> {timeAgo(j.assignedAt)}
                </span>
              </div>

              {/* Pay + AI Note */}
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-lg font-bold text-accent-700">
                  <DollarSign size={16} /> PKR {j.pay.toLocaleString()}
                </span>
                {j.status === "auto-assigned" && (
                  <span className="text-[11px] text-brand-600 font-semibold flex items-center gap-1">
                    <Bot size={12} /> AI-assigned
                  </span>
                )}
              </div>

              {/* Status-specific action */}
              {j.status === "auto-assigned" && (
                <div className="mt-3 rounded-xl bg-brand-50 border border-brand-100 px-3 py-2 text-xs text-brand-700">
                  ✅ Aapko automatically assign ho gaya — bas samay par pahunchen
                </div>
              )}
              {j.status === "in-progress" && (
                <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
                  🔧 Kaam jaari hai — customer wait kar raha hai
                </div>
              )}
              {j.status === "completed" && (
                <div className="mt-3 rounded-xl bg-green-50 border border-green-100 px-3 py-2 text-xs text-green-700">
                  ✅ Mukammal — payment process ho rahi hai
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
