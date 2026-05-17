"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, logout, getUserBookings, getUserFeedback, type AuthUser } from "@/lib/auth";
import {
  User, Phone, CreditCard, MapPin, Star, CalendarCheck,
  Bell, Shield, HelpCircle, LogOut, ChevronRight, Package,
  X, Lock, Eye, MessageCircle, AlertTriangle,
} from "lucide-react";

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white text-2xl font-bold shadow-lg">
      {initials}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-stone-100 py-3 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="truncate text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ title, icon: Icon, children, onClose }: {
  title: string; icon: React.ElementType; children: React.ReactNode; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-6">
      <div className="w-full max-w-md flex flex-col rounded-3xl bg-white shadow-2xl" style={{ maxHeight: "85vh" }}>
        {/* Fixed header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-stone-100 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
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

function PrivacyModal({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState({ location: true, notifications: true, history: true, data: false });
  const toggle = (k: keyof typeof s) => setS((prev) => ({ ...prev, [k]: !prev[k] }));
  const items = [
    { k: "location" as const, icon: Eye, label: "Share Location", sub: "Ustaad ko location dikhao" },
    { k: "notifications" as const, icon: Bell, label: "Push Notifications", sub: "Booking alerts" },
    { k: "history" as const, icon: Lock, label: "Save Booking History", sub: "Past orders store karein" },
    { k: "data" as const, icon: Shield, label: "Analytics Sharing", sub: "AI improve karne ke liye" },
  ];
  return (
    <Modal title="Privacy & Security" icon={Shield} onClose={onClose}>
      <div className="space-y-3">
        {items.map(({ k, icon: Icon, label, sub }) => (
          <div key={k} className="flex items-center gap-3 rounded-2xl border border-stone-100 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-ink-muted">
              <Icon size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="text-xs text-ink-muted">{sub}</p>
            </div>
            <button onClick={() => toggle(k)} className={`relative h-6 w-11 rounded-full transition-colors ${s[k] ? "bg-brand-500" : "bg-stone-200"}`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${s[k] ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 flex items-center gap-2">
        <AlertTriangle size={16} className="text-red-500 shrink-0" />
        <p className="text-xs text-red-700">Account delete ke liye support se rabta karein</p>
      </div>
    </Modal>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  const faqs = [
    { q: "Booking cancel kaise karein?", a: "Meri Bookings mein jayen, booking select karein aur 'Cancel' option use karein." },
    { q: "Ustaad time par nahi aaya?", a: "Notifications mein 'Report' button use karein — AI automatically naya ustaad dhundh lega." },
    { q: "Payment refund kaise milega?", a: "Help & Support mein WhatsApp par message karein. Refund 3-5 working days mein process ho ga." },
    { q: "Review kaise dein?", a: "Job complete hone ke baad My Reviews mein jayen aur rating dein." },
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
export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating] = useState<string>("—");
  const [modal, setModal] = useState<"privacy" | "help" | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "user") { router.push("/select-role"); return; }
    setUser(u);
    const bookings = getUserBookings(u.phone);
    const feedback = getUserFeedback(u.phone);
    setBookingCount(bookings.length);
    setReviewCount(feedback.length);
    if (feedback.length > 0) {
      const avg = feedback.reduce((s, f) => s + f.rating, 0) / feedback.length;
      setAvgRating(avg.toFixed(1) + "★");
    }
  }, [router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/select-role");
  };

  return (
    <>
      {modal === "privacy" && <PrivacyModal onClose={() => setModal(null)} />}
      {modal === "help" && <HelpModal onClose={() => setModal(null)} />}

      <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
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
        <div className="card-elevated mb-5 p-5">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} />
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold text-ink truncate">{user.name}</p>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700">
                <User size={12} /> Customer
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 divide-x divide-stone-100 rounded-2xl bg-stone-50 text-center">
            {[
              [String(bookingCount), "Bookings"],
              [String(reviewCount), "Reviews"],
              [avgRating, "Avg. Rating"],
            ].map(([val, lbl]) => (
              <div key={lbl} className="py-3">
                <p className="text-lg font-bold text-ink">{val}</p>
                <p className="text-[10px] font-semibold text-ink-muted">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div className="card mb-4 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Account Details</p>
          <InfoRow icon={User}       label="Full Name"  value={user.name} />
          <InfoRow icon={Phone}      label="Mobile"     value={user.phone} />
          <InfoRow icon={CreditCard} label="CNIC"       value={user.cnic} />
          {user.address && <InfoRow icon={MapPin} label="Address" value={user.address} />}
        </div>

        {/* Quick Links */}
        <div className="card mb-4 divide-y divide-stone-100 overflow-hidden">
          {[
            { href: "/bookings",      icon: Package,       label: "My Bookings",    sub: "View all past & upcoming", color: "bg-brand-50 text-brand-600" },
            { href: "/notifications", icon: Bell,          label: "Notifications",  sub: "Alerts & reminders",       color: "bg-purple-50 text-purple-600" },
            { href: "/feedback",      icon: Star,          label: "My Reviews",     sub: "Ratings you gave",         color: "bg-amber-50 text-amber-600" },
            { href: "/",              icon: CalendarCheck, label: "Book a Service", sub: "Hire an ustaad now",       color: "bg-green-50 text-green-600" },
          ].map(({ href, icon: Icon, label, sub, color }) => (
            <Link key={label} href={href} className="flex items-center gap-4 p-4 hover:bg-stone-50 transition">
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

        {/* Settings — all functional */}
        <div className="card divide-y divide-stone-100 overflow-hidden">
          <button
            onClick={() => setModal("privacy")}
            className="flex w-full items-center gap-4 p-4 hover:bg-stone-50 transition"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Shield size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-ink text-sm">Privacy & Security</p>
              <p className="text-xs text-ink-muted">Location, notifications, data</p>
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
