"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, logout, type AuthUser } from "@/lib/auth";
import {
  User, Phone, CreditCard, MapPin, Star, CalendarCheck,
  Bell, Shield, HelpCircle, LogOut, ChevronRight, Package,
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

export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "user") { router.push("/select-role"); return; }
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
          {[["0", "Bookings"], ["0", "Reviews"], ["—", "Avg. Rating"]].map(([val, lbl]) => (
            <div key={lbl} className="py-3">
              <p className="text-lg font-bold text-ink">{val}</p>
              <p className="text-[10px] font-semibold text-ink-muted">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="card mb-4 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Account Details</p>
        <InfoRow icon={User}       label="Full Name"    value={user.name} />
        <InfoRow icon={Phone}      label="Mobile"       value={user.phone} />
        <InfoRow icon={CreditCard} label="CNIC"         value={user.cnic} />
        {user.address && <InfoRow icon={MapPin} label="Address" value={user.address} />}
      </div>

      {/* Quick Links */}
      <div className="card mb-4 divide-y divide-stone-100 overflow-hidden">
        {[
          { href: "/bookings",      icon: Package,       label: "My Bookings",     sub: "View all past & upcoming" },
          { href: "/notifications", icon: Bell,          label: "Notifications",   sub: "Alerts & reminders" },
          { href: "/feedback",      icon: Star,          label: "My Reviews",      sub: "Ratings you gave" },
          { href: "/",              icon: CalendarCheck, label: "Book a Service",  sub: "Hire an ustaad now" },
        ].map(({ href, icon: Icon, label, sub }) => (
          <Link key={href} href={href} className="flex items-center gap-4 p-4 hover:bg-stone-50 transition">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
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

      {/* Settings */}
      <div className="card divide-y divide-stone-100 overflow-hidden">
        {[
          { href: "#", icon: Shield,     label: "Privacy & Security" },
          { href: "#", icon: HelpCircle, label: "Help & Support" },
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
