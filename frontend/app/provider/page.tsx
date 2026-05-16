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
  { href: "/provider/jobs", icon: Briefcase, label: "Job Requests" },
  { href: "/provider/calendar", icon: Calendar, label: "Schedule" },
  { href: "/provider/earnings", icon: DollarSign, label: "Earnings" },
  { href: "/provider/reputation", icon: Star, label: "Reputation" },
  { href: "/provider/cancellations", icon: TrendingDown, label: "Cancellations" },
  { href: "/provider/availability", icon: Clock, label: "Availability" },
  { href: "/provider/routes", icon: Map, label: "Route Optimization" },
];

export default function ProviderDashboard() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-1">Provider Dashboard</h1>
      <p className="text-sm text-white/50 mb-6">Hassan AC Experts</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Today's jobs" value="3" />
        <StatCard label="Earnings" value="PKR 12.4k" />
        <StatCard label="Rating" value="4.8" />
        <StatCard label="On-time" value="91%" />
      </div>

      <div className="space-y-2">
        {LINKS.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="flex items-center justify-between glass rounded-xl p-4">
            <span className="flex items-center gap-3">
              <Icon size={20} className="text-brand-400" />
              {label}
            </span>
            <ChevronRight size={16} className="text-white/30" />
          </Link>
        ))}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-lg font-bold gradient-text">{value}</p>
    </div>
  );
}
