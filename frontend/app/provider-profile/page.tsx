"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, logout, type AuthUser } from "@/lib/auth";
import {
  Wrench, Phone, CreditCard, Clock, FileText,
  Star, DollarSign, Calendar, Bell, Shield, HelpCircle,
  LogOut, ChevronRight, TrendingUp, CheckCircle2,
} from "lucide-react";

function ProviderAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent-500 to-accent-700 text-white text-2xl font-bold shadow-lg">
      {initials}
    </div>
  );
}

export default function ProviderProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

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

      {/* Profile Hero - Provider-specific green/amber gradient */}
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

        {/* Stats */}
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
          { icon: Phone,      label: "Mobile",  value: user.phone },
          { icon: CreditCard, label: "CNIC",    value: user.cnic },
          { icon: Wrench,     label: "Domain",  value: user.domain || "—" },
          { icon: Clock,      label: "Experience", value: user.experience ? `${user.experience} years` : "—" },
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

      {/* Provider Quick Links */}
      <div className="card mb-4 divide-y divide-stone-100 overflow-hidden">
        {[
          { href: "/provider/jobs",      icon: Wrench,     label: "My Jobs",         sub: "Active & pending requests" },
          { href: "/provider/earnings",  icon: DollarSign, label: "Earnings",         sub: "Weekly payout summary" },
          { href: "/provider/calendar",  icon: Calendar,   label: "Schedule",         sub: "Manage your availability" },
          { href: "/provider/reputation",icon: Star,       label: "Reputation",       sub: "Ratings & trust score" },
          { href: "/notifications",      icon: Bell,       label: "Notifications",    sub: "Job alerts & updates" },
        ].map(({ href, icon: Icon, label, sub }) => (
          <Link key={href} href={href} className="flex items-center gap-4 p-4 hover:bg-stone-50 transition">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
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

      {/* Settings / Logout */}
      <div className="card divide-y divide-stone-100 overflow-hidden">
        {[
          { href: "#", icon: TrendingUp,  label: "Performance Analytics" },
          { href: "#", icon: Shield,      label: "Privacy & Security" },
          { href: "#", icon: HelpCircle,  label: "Help & Support" },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={label} href={href} className="flex items-center gap-4 p-4 hover:bg-stone-50 transition">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-ink-muted">
              <Icon size={20} />
            </div>
            <p className="flex-1 font-semibold text-ink text-sm">{label}</p>
            <ChevronRight size={16} className="text-ink-faint" />
          </Link>
        ))}
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
  );
}
