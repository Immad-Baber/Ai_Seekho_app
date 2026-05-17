"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, logout, type AuthUser } from "@/lib/auth";
import {
  Wrench, Phone, CreditCard, Clock,
  Star, DollarSign, Calendar, Bell, Shield, HelpCircle,
  LogOut, ChevronRight, TrendingUp, CheckCircle2, X,
  BarChart2, Lock, MessageCircle, FileText, Eye, AlertTriangle,
} from "lucide-react";

function ProviderAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent-500 to-accent-700 text-white text-2xl font-bold shadow-lg">
      {initials}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, icon: Icon, children, onClose }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-6">
      <div className="w-full max-w-md flex flex-col rounded-3xl bg-white shadow-2xl" style={{ maxHeight: "85vh" }}>
        {/* Fixed header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-stone-100 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
            <Icon size={20} />
          </div>
          <p className="flex-1 font-bold text-ink">{title}</p>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-ink-muted hover:bg-stone-200 transition">
            <X size={16} />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function PerformanceModal({ onClose }: { onClose: () => void }) {
  const metrics = [
    { label: "Jobs Completed", value: "47", sub: "This month", color: "text-green-600", bg: "bg-green-50" },
    { label: "Average Rating", value: "4.8★", sub: "From 47 reviews", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "On-Time Rate", value: "91%", sub: "Industry avg: 78%", color: "text-brand-600", bg: "bg-brand-50" },
    { label: "Response Time", value: "4 min", sub: "To accept jobs", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Cancellation Rate", value: "3%", sub: "Very low ✅", color: "text-green-600", bg: "bg-green-50" },
    { label: "Repeat Customers", value: "62%", sub: "Return bookings", color: "text-accent-600", bg: "bg-accent-50" },
  ];
  return (
    <Modal title="Performance Analytics" icon={BarChart2} onClose={onClose}>
      <p className="text-xs text-ink-muted mb-4">Aapki performance is mahine (May 2026)</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className={`rounded-2xl ${m.bg} p-3`}>
            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs font-semibold text-ink mt-0.5">{m.label}</p>
            <p className="text-[10px] text-ink-muted">{m.sub}</p>
          </div>
        ))}
      </div>
      {/* Mini bar chart */}
      <p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-2">Weekly trend</p>
      <div className="flex items-end gap-1 h-16 mb-1">
        {[40, 65, 55, 80, 70, 90, 60].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-lg bg-accent-400/70 transition-all" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="flex justify-around text-[9px] text-ink-faint font-semibold">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
    </Modal>
  );
}

function PrivacyModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState({
    location: true,
    profile_visible: true,
    phone_visible: false,
    notifications: true,
    data_sharing: false,
  });
  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  const items = [
    { key: "location" as const, icon: Eye, label: "Live Location Sharing", sub: "Customer ko location dikhao" },
    { key: "profile_visible" as const, icon: FileText, label: "Public Profile", sub: "Marketplace mein dikhao" },
    { key: "phone_visible" as const, icon: Phone, label: "Show Phone Number", sub: "Customers ko number dikhao" },
    { key: "notifications" as const, icon: Bell, label: "Push Notifications", sub: "Job alerts aur updates" },
    { key: "data_sharing" as const, icon: Lock, label: "Analytics Data Sharing", sub: "Improve AI matching" },
  ];
  return (
    <Modal title="Privacy & Security" icon={Shield} onClose={onClose}>
      <div className="space-y-3">
        {items.map(({ key, icon: Icon, label, sub }) => (
          <div key={key} className="flex items-center gap-3 rounded-2xl border border-stone-100 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-ink-muted">
              <Icon size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="text-xs text-ink-muted">{sub}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative h-6 w-11 rounded-full transition-colors ${settings[key] ? "bg-accent-500" : "bg-stone-200"}`}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${settings[key] ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 flex items-center gap-2">
        <AlertTriangle size={16} className="text-red-500 shrink-0" />
        <p className="text-xs text-red-700">Account delete karne ke liye support se rabta karein</p>
      </div>
    </Modal>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  const faqs = [
    { q: "Booking cancel kaise karein?", a: "Jobs page par jayen, job select karein, aur 'Emergency Cancel' dabayein. AI automatically naya ustaad dhundh lega." },
    { q: "Payment kab milti hai?", a: "Job complete hone ke 24 ghante baad automatically aapke account mein aa jati hai." },
    { q: "Rating improve kaise karein?", a: "On-time aayein, customer se achi baat karein, aur kaam sahi karo. AI aapki rating automatically update karta hai." },
    { q: "New area mein kaam kaise milega?", a: "Availability settings mein apna area update karein. AI us area ke jobs automatically assign kar dega." },
  ];
  return (
    <Modal title="Help & Support" icon={HelpCircle} onClose={onClose}>
      <div className="mb-4 rounded-2xl bg-brand-50 border border-brand-100 p-4 flex items-center gap-3">
        <MessageCircle size={20} className="text-brand-600 shrink-0" />
        <div>
          <p className="font-semibold text-ink text-sm">Live Support</p>
          <p className="text-xs text-ink-muted">WhatsApp: +92 300 1234567</p>
          <p className="text-xs text-ink-muted">Mon–Sat · 9 AM – 9 PM</p>
        </div>
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-3">Aksar puche jane wale sawalat</p>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="rounded-2xl border border-stone-100 overflow-hidden">
            <summary className="cursor-pointer p-3 text-sm font-semibold text-ink list-none flex items-center justify-between">
              {faq.q}
              <ChevronRight size={14} className="text-ink-faint shrink-0" />
            </summary>
            <div className="px-3 pb-3 text-xs text-ink-muted leading-relaxed border-t border-stone-100 pt-2">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProviderProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [modal, setModal] = useState<"analytics" | "privacy" | "help" | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "provider") { router.push("/select-role"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/select-role");
  };

  return (
    <>
      {modal === "analytics" && <PerformanceModal onClose={() => setModal(null)} />}
      {modal === "privacy" && <PrivacyModal onClose={() => setModal(null)} />}
      {modal === "help" && <HelpModal onClose={() => setModal(null)} />}

      <main className="flex min-h-screen flex-col px-4 pt-6 pb-36">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-ink">My Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>

        {/* Profile Hero */}
        <div className="mb-5 rounded-3xl bg-gradient-to-br from-accent-600 to-amber-700 p-5 text-white shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <ProviderAvatar name={user.name} />
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold truncate">{user.name}</p>
              <p className="text-sm text-accent-100 font-medium">{user.domain || "Service Professional"}</p>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">
                <CheckCircle2 size={12} /> Verified Ustaad
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/20 rounded-2xl bg-white/10 text-center">
            {[
              [user.experience ? `${user.experience}yr` : "—", "Experience"],
              ["4.8", "Rating"],
              ["91%", "On-time"],
            ].map(([val, lbl]) => (
              <div key={lbl} className="py-3">
                <p className="text-lg font-bold">{val}</p>
                <p className="text-[10px] text-accent-100 font-semibold">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="card mb-4 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-muted">About</p>
            <p className="text-sm text-ink leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* Account Details */}
        <div className="card mb-4 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Account Details</p>
          {[
            { icon: Phone, label: "Mobile", value: user.phone },
            { icon: CreditCard, label: "CNIC", value: user.cnic },
            { icon: Wrench, label: "Domain", value: user.domain || "—" },
            { icon: Clock, label: "Experience", value: user.experience ? `${user.experience} years` : "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 border-b border-stone-100 py-3 last:border-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
                <p className="truncate text-sm font-semibold text-ink">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="card mb-4 divide-y divide-stone-100 overflow-hidden">
          {[
            { href: "/provider/jobs", icon: Wrench, label: "My Jobs", sub: "Active & pending requests", color: "bg-accent-50 text-accent-600" },
            { href: "/provider/earnings", icon: DollarSign, label: "Kamai", sub: "Weekly payout summary", color: "bg-green-50 text-green-600" },
            { href: "/provider/calendar", icon: Calendar, label: "Schedule", sub: "Manage your availability", color: "bg-brand-50 text-brand-600" },
            { href: "/provider/reputation", icon: Star, label: "Reputation", sub: "Ratings & trust score", color: "bg-amber-50 text-amber-600" },
            { href: "/notifications", icon: Bell, label: "Notifications", sub: "Job alerts & updates", color: "bg-purple-50 text-purple-600" },
          ].map(({ href, icon: Icon, label, sub, color }) => (
            <Link key={href} href={href} className="flex items-center gap-4 p-4 hover:bg-stone-50 transition">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink text-sm">{label}</p>
                <p className="text-xs text-ink-muted">{sub}</p>
              </div>
              <ChevronRight size={16} className="text-ink-faint" />
            </Link>
          ))}
        </div>

        {/* Settings — all 3 are now functional */}
        <div className="card mb-8 divide-y divide-stone-100 overflow-hidden">
          <button
            onClick={() => setModal("analytics")}
            className="flex w-full items-center gap-4 p-4 hover:bg-stone-50 transition"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <TrendingUp size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-ink text-sm">Performance Analytics</p>
              <p className="text-xs text-ink-muted">Ratings, on-time, jobs graph</p>
            </div>
            <ChevronRight size={16} className="text-ink-faint" />
          </button>

          <button
            onClick={() => setModal("privacy")}
            className="flex w-full items-center gap-4 p-4 hover:bg-stone-50 transition"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Shield size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-ink text-sm">Privacy & Security</p>
              <p className="text-xs text-ink-muted">Location, visibility, data</p>
            </div>
            <ChevronRight size={16} className="text-ink-faint" />
          </button>

          <button
            onClick={() => setModal("help")}
            className="flex w-full items-center gap-4 p-4 hover:bg-stone-50 transition"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <HelpCircle size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-ink text-sm">Help & Support</p>
              <p className="text-xs text-ink-muted">FAQs, WhatsApp, contact</p>
            </div>
            <ChevronRight size={16} className="text-ink-faint" />
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 p-4 hover:bg-red-50 transition"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
              <LogOut size={20} />
            </div>
            <p className="flex-1 text-left font-semibold text-red-500 text-sm">Logout</p>
          </button>
        </div>
      </main>
    </>
  );
}
