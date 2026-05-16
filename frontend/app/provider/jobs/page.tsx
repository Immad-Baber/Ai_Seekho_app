"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bot, CheckCircle2, Clock, MapPin, DollarSign,
  Zap, Calendar, Loader2, XCircle, AlertTriangle, RefreshCw,
  Star, Navigation,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import { runReAssignmentAgent, type ProviderPool } from "@/lib/agent";

// ─── Types ──────────────────────────────────────────────────────────────────

type JobStatus = "auto-assigned" | "in-progress" | "completed" | "cancelled" | "re-assigning";

interface Job {
  id: string;
  service: string;
  area: string;
  time: string;
  pay: number;
  status: JobStatus;
  customer: string;
  customerPhone: string; // to notify user
  bookingId: string;
  assignedAt: string;
  cancelReason?: string;
  reAssignedTo?: ProviderPool;
}

// ─── Initial Demo Data ───────────────────────────────────────────────────────

const INITIAL_JOBS: Job[] = [
  {
    id: "J1", service: "AC gas refill", area: "G-13", time: "10:00 AM",
    pay: 4500, status: "auto-assigned", customer: "Ali Khan",
    customerPhone: "03001234567", bookingId: "BK-001",
    assignedAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: "J2", service: "Geyser leak repair", area: "G-10", time: "11:30 AM",
    pay: 2800, status: "in-progress", customer: "Fatima Malik",
    customerPhone: "03009876543", bookingId: "BK-002",
    assignedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "J3", service: "Fan wiring & installation", area: "F-8", time: "2:00 PM",
    pay: 2600, status: "completed", customer: "Ahmed Raza",
    customerPhone: "03005551234", bookingId: "BK-003",
    assignedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: "J4", service: "Airport drop", area: "F-7", time: "6:30 AM",
    pay: 1800, status: "completed", customer: "Sara Iqbal",
    customerPhone: "03007778888", bookingId: "BK-004",
    assignedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: "J5", service: "Deep cleaning (3 rooms)", area: "Bahria", time: "4:00 PM",
    pay: 3600, status: "auto-assigned", customer: "Umar Farooq",
    customerPhone: "03332221111", bookingId: "BK-005",
    assignedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

const CANCEL_REASONS = [
  "Emergency (ghar mein masla ho gaya)",
  "Tabiyat theek nahi",
  "Gaari kharab ho gayi",
  "Pehle wala kaam extend ho gaya",
  "Doosri wajah",
];

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; icon: React.ElementType }> = {
  "auto-assigned": { label: "Auto-Assigned",  color: "text-brand-700 bg-brand-50 border-brand-200",   icon: Bot },
  "in-progress":   { label: "In Progress",    color: "text-amber-700 bg-amber-50 border-amber-200",    icon: Loader2 },
  "completed":     { label: "Mukammal",       color: "text-green-700 bg-green-50 border-green-200",    icon: CheckCircle2 },
  "cancelled":     { label: "Cancel Kiya",    color: "text-red-600   bg-red-50   border-red-200",      icon: XCircle },
  "re-assigning":  { label: "AI Re-assigning",color: "text-purple-700 bg-purple-50 border-purple-200", icon: RefreshCw },
};

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "Abhi";
  if (m < 60) return `${m} min pehle`;
  return `${Math.floor(m / 60)} ghante pehle`;
}

// ─── Cancel Modal ────────────────────────────────────────────────────────────

function CancelModal({
  job,
  onConfirm,
  onClose,
}: {
  job: Job;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-500">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="font-bold text-ink">Task Cancel Karna Chahte Hain?</p>
            <p className="text-xs text-ink-muted">{job.service} · {job.customer}</p>
          </div>
        </div>

        <div className="mb-1 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          ⚡ AI agent <strong>turant</strong> doosra ustaad dhundh lega aur customer ko notify karega
        </div>

        <p className="mt-4 mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
          Cancel ki wajah
        </p>
        <div className="space-y-2 mb-5">
          {CANCEL_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                reason === r
                  ? "border-brand-400 bg-brand-50 text-brand-700 font-semibold"
                  : "border-stone-200 text-ink hover:bg-stone-50"
              }`}
            >
              <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${reason === r ? "border-brand-500 bg-brand-500" : "border-stone-300"}`} />
              {r}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-stone-200 py-3 text-sm font-semibold text-ink-muted hover:bg-stone-50 transition"
          >
            Wapas Jao
          </button>
          <button
            onClick={() => reason && onConfirm(reason)}
            disabled={!reason}
            className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-bold text-white disabled:opacity-40 hover:bg-red-600 transition"
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Re-Assignment Overlay ───────────────────────────────────────────────────

function ReAssigningOverlay({ job }: { job: Job }) {
  const [step, setStep] = useState(0);
  const STEPS = [
    "Cancel record ho raha hai...",
    "Available providers check kar raha hai...",
    "Score calculate ho raha hai (rating + distance)...",
    "Best match select kar raha hai...",
    "Customer ko notify kar raha hai...",
  ];

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      if (i < STEPS.length) setStep(i);
      else clearInterval(t);
    }, 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-3 rounded-2xl bg-purple-50 border border-purple-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin shrink-0" />
        <p className="font-bold text-sm text-purple-700">AI Agent Running...</p>
      </div>
      <div className="space-y-1.5">
        {STEPS.map((s, idx) => (
          <div key={s} className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${idx <= step ? "opacity-100" : "opacity-25"}`}>
            {idx < step ? (
              <CheckCircle2 size={13} className="text-purple-500 shrink-0" />
            ) : idx === step ? (
              <div className="h-3 w-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin shrink-0" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-stone-300 shrink-0" />
            )}
            <span className={idx <= step ? "text-purple-700 font-medium" : "text-ink-faint"}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Re-Assigned Card ────────────────────────────────────────────────────────

function ReAssignedResult({ provider }: { provider: ProviderPool }) {
  return (
    <div className="mt-3 rounded-2xl bg-green-50 border border-green-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 size={16} className="text-green-600" />
        <p className="font-bold text-sm text-green-700">Naya Ustaad Assign Ho Gaya!</p>
      </div>
      <p className="font-bold text-ink text-base">{provider.name}</p>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-amber-800 font-semibold">
          <Star size={11} fill="currentColor" /> {provider.rating}★
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-ink-muted">
          <MapPin size={11} /> {provider.distance_km} km
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-ink-muted">
          <Navigation size={11} /> ETA {provider.eta_minutes} min
        </span>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-ink">
          PKR {provider.hourly_rate}/hr
        </span>
      </div>
      <p className="mt-2 text-xs text-green-600 font-medium">
        ✅ Customer ko SMS/App notification bhej di gayi
      </p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProviderJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [cancelModal, setCancelModal] = useState<Job | null>(null);
  const [providerInfo, setProviderInfo] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "provider") { router.push("/select-role"); return; }
    setProviderInfo({ id: u.cnic.replace(/-/g, ""), name: u.name });
  }, [router]);

  const handleCancelConfirm = useCallback(async (job: Job, reason: string) => {
    setCancelModal(null);

    // Mark as re-assigning
    setJobs((prev) =>
      prev.map((j) => j.id === job.id ? { ...j, status: "re-assigning", cancelReason: reason } : j)
    );

    // Run agent
    const result = await runReAssignmentAgent(
      providerInfo?.id || "SELF",
      job.service,
      job.customerPhone,
      job.bookingId,
    );

    // Update job with result
    setJobs((prev) =>
      prev.map((j) =>
        j.id === job.id
          ? {
              ...j,
              status: "cancelled",
              cancelReason: reason,
              reAssignedTo: result.newProvider || undefined,
            }
          : j
      )
    );
  }, [providerInfo]);

  const canCancel = (status: JobStatus) =>
    status === "auto-assigned" || status === "in-progress";

  const displayJobs =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const counts = {
    "all": jobs.length,
    "auto-assigned": jobs.filter((j) => j.status === "auto-assigned").length,
    "in-progress": jobs.filter((j) => j.status === "in-progress").length,
    "completed": jobs.filter((j) => j.status === "completed").length,
    "cancelled": jobs.filter((j) => j.status === "cancelled" || j.status === "re-assigning").length,
  };

  return (
    <>
      {cancelModal && (
        <CancelModal
          job={cancelModal}
          onConfirm={(reason) => handleCancelConfirm(cancelModal, reason)}
          onClose={() => setCancelModal(null)}
        />
      )}

      <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
        <Link href="/provider" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-5">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="mb-4">
          <h1 className="font-display text-xl font-bold text-ink">Meri Jobs</h1>
          <p className="text-sm text-ink-muted flex items-center gap-1.5 mt-0.5">
            <Bot size={14} className="text-brand-600" />
            AI ne automatically assign kiya — emergency mein cancel karo, agent naya ustaad dhundhe ga
          </p>
        </div>

        {/* AI Banner */}
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Zap size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Autonomous Matching Active</p>
              <p className="text-xs text-brand-100 mt-0.5">
                Cancel ke baad AI turant next best ustaad select karta hai aur customer ko notify karta hai
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {(["all", "auto-assigned", "in-progress", "completed", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                filter === f
                  ? "bg-brand-600 text-white shadow"
                  : "bg-stone-100 text-ink-muted hover:bg-stone-200"
              }`}
            >
              {f === "all" ? "Sab" : f === "auto-assigned" ? "Assigned" : f === "in-progress" ? "Jaari" : f === "completed" ? "Mukammal" : "Cancelled"}
              <span className="ml-1 opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>

        {/* Jobs List */}
        <div className="space-y-3">
          {displayJobs.map((j) => {
            const cfg = STATUS_CONFIG[j.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={j.id}
                className={`card p-4 transition ${
                  j.status === "cancelled" ? "opacity-80" : ""
                } ${j.status === "re-assigning" ? "ring-2 ring-purple-400" : ""}`}
              >
                {/* Status + ID */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${cfg.color} ${j.status === "re-assigning" ? "animate-pulse" : ""}`}>
                    <StatusIcon size={12} className={j.status === "re-assigning" ? "animate-spin" : ""} />
                    {cfg.label}
                  </span>
                  <span className="font-mono text-[11px] text-ink-faint">#{j.id}</span>
                </div>

                {/* Service & Customer */}
                <p className="font-bold text-ink text-base">{j.service}</p>
                <p className="text-sm text-ink-muted mt-0.5">Customer: {j.customer}</p>

                {/* Details */}
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

                {/* Pay */}
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

                {/* Status-specific content */}
                {j.status === "auto-assigned" && (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-xl bg-brand-50 border border-brand-100 px-3 py-2 text-xs text-brand-700">
                      ✅ Aapko assign ho gaya — samay par pahunchein
                    </div>
                    <button
                      onClick={() => setCancelModal(j)}
                      className="w-full rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={13} /> Emergency mein cancel karo
                    </button>
                  </div>
                )}

                {j.status === "in-progress" && (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
                      🔧 Kaam jaari hai — customer wait kar raha hai
                    </div>
                    <button
                      onClick={() => setCancelModal(j)}
                      className="w-full rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={13} /> Emergency mein cancel karo
                    </button>
                  </div>
                )}

                {j.status === "re-assigning" && (
                  <ReAssigningOverlay job={j} />
                )}

                {j.status === "cancelled" && (
                  <div className="mt-3 space-y-2">
                    {j.cancelReason && (
                      <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
                        ❌ Cancel wajah: {j.cancelReason}
                      </div>
                    )}
                    {j.reAssignedTo ? (
                      <ReAssignedResult provider={j.reAssignedTo} />
                    ) : (
                      <div className="rounded-xl bg-stone-50 border border-stone-200 px-3 py-2 text-xs text-ink-muted">
                        ⚠️ Koi available ustaad nahi mila
                      </div>
                    )}
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
    </>
  );
}
