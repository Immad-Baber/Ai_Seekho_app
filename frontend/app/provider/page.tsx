"use client";

import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Star,
  TrendingDown,
  Clock,
  Map,
  Briefcase,
  ChevronRight,
} from "lucide-react";

const LINKS = [
  { href: "/provider/jobs", icon: Briefcase, label: "Naye kaam", desc: "Requests accept karein" },
  { href: "/provider/calendar", icon: Calendar, label: "Calendar", desc: "Schedule dekhein" },
  { href: "/provider/earnings", icon: DollarSign, label: "Kamai", desc: "Weekly earnings" },
  { href: "/provider/reputation", icon: Star, label: "Reputation", desc: "Rating & trust" },
  { href: "/provider/cancellations", icon: TrendingDown, label: "Cancellations", desc: "Track record" },
  { href: "/provider/availability", icon: Clock, label: "Availability", desc: "Online / offline" },
  { href: "/provider/routes", icon: Map, label: "Routes", desc: "Optimized stops" },
];

export default function ProviderDashboard() {
  return (
    <main className="p-4">
      <div className="card-elevated mb-6 bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white">
        <p className="text-brand-100 text-sm">Provider operations</p>
        <h1 className="font-display text-2xl font-bold mt-1">Multi-service network</h1>
        <p className="mt-1 text-xs text-brand-100">AC, plumber, electrician, driver, safai, beauty, tutor, mechanic</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold">3</p>
            <p className="text-[10px] text-brand-100">Aaj ke kaam</p>
          </div>
          <div>
            <p className="text-2xl font-bold">4.8</p>
            <p className="text-[10px] text-brand-100">Rating</p>
          </div>
          <div>
            <p className="text-2xl font-bold">91%</p>
            <p className="text-[10px] text-brand-100">On-time</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {LINKS.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="card flex items-center justify-between p-4 hover:shadow-card-hover"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon size={20} />
              </span>
              <span>
                <span className="font-semibold text-ink block">{label}</span>
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
