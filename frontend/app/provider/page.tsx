"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, type AuthUser } from "@/lib/auth";
import {
  Calendar, DollarSign, Star, TrendingDown,
  Clock, Map, Briefcase, ChevronRight, UserCircle,
} from "lucide-react";

const LINKS = [
  { href: "/provider/jobs",         icon: Briefcase,    label: "Naye kaam",    desc: "Requests accept karein" },
  { href: "/provider/calendar",     icon: Calendar,     label: "Calendar",     desc: "Schedule dekhein" },
  { href: "/provider/earnings",     icon: DollarSign,   label: "Kamai",        desc: "Weekly earnings" },
  { href: "/provider/reputation",   icon: Star,         label: "Reputation",   desc: "Rating & trust" },
  { href: "/provider/cancellations",icon: TrendingDown, label: "Cancellations",desc: "Track record" },
  { href: "/provider/availability", icon: Clock,        label: "Availability", desc: "Online / offline" },
  { href: "/provider/routes",       icon: Map,          label: "Routes",       desc: "Optimized stops" },
];

export default function ProviderDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) { router.push("/select-role"); return; }
    if (u.role !== "provider") { router.push("/"); return; }
    setUser(u);
  }, [router]);

  if (!mounted || !user) return null;

  const firstName = user.name.split(" ")[0];

  return (
    <main className="flex min-h-screen flex-col px-4 pt-5 pb-28">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-ink-muted">Khush Amdeed,</p>
          <h1 className="font-display text-xl font-bold text-ink">{firstName} 👋</h1>
        </div>
        <Link
          href="/provider-profile"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700 hover:bg-accent-200 transition"
        >
          <UserCircle size={22} />
        </Link>
      </div>

      {/* Hero Card */}
      <div className="mb-5 rounded-3xl bg-gradient-to-br from-accent-600 to-amber-700 p-5 text-white shadow-lg">
        <p className="text-accent-100 text-sm font-medium">{user.domain || "Service Professional"}</p>
        <h2 className="font-display text-2xl font-bold mt-0.5">{user.name}</h2>
        <p className="mt-1 text-xs text-accent-100">AI-powered job matching · Antigravity Platform</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["3", "Aaj ke kaam"], ["4.8", "Rating"], ["91%", "On-time"]].map(([val, lbl]) => (
            <div key={lbl} className="rounded-2xl bg-white/15 py-2.5">
              <p className="text-xl font-bold">{val}</p>
              <p className="text-[10px] text-accent-100 mt-0.5">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <p className="section-title mb-3">Operations</p>
      <div className="space-y-2">
        {LINKS.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}
            className="card flex items-center justify-between p-4 hover:shadow-card-hover transition">
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                <Icon size={20} />
              </span>
              <span>
                <span className="font-semibold text-ink block text-sm">{label}</span>
                <span className="text-xs text-ink-muted">{desc}</span>
              </span>
            </span>
            <ChevronRight size={18} className="text-ink-faint" />
          </Link>
        ))}
      </div>
    </main>
  );
}
