"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, CheckCircle2, XCircle, Loader2, ChevronRight } from "lucide-react";
import { getUser, getUserBookings, type UserBooking } from "@/lib/auth";

const STATUS_CONFIG: Record<
  UserBooking["status"],
  { label: string; color: string; icon: React.ElementType }
> = {
  confirmed:   { label: "Confirmed",   color: "text-brand-700 bg-brand-50",   icon: CheckCircle2 },
  "in-progress": { label: "In Progress", color: "text-amber-700 bg-amber-50",   icon: Loader2 },
  completed:   { label: "Mukammal",    color: "text-green-700 bg-green-50",    icon: CheckCircle2 },
  cancelled:   { label: "Cancel",      color: "text-red-600  bg-red-50",       icon: XCircle },
};

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push("/select-role"); return; }
    setBookings(getUserBookings(user.phone));
    setLoaded(true);
  }, [router]);

  if (!loaded) return null;

  return (
    <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-ink">Meri Bookings</h1>
        <p className="text-sm text-ink-muted">Purane aur active kaam</p>
      </div>

      {bookings.length === 0 ? (
        <div className="card flex flex-col items-center py-14 text-center">
          <CalendarDays className="text-ink-faint mb-3" size={44} />
          <p className="font-semibold text-ink">Abhi koi booking nahi</p>
          <p className="text-sm text-ink-muted mt-1 mb-5">Pehla kaam book karein</p>
          <Link href="/" className="btn-primary px-6">
            Naya kaam dhundhein
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const cfg = STATUS_CONFIG[b.status];
            const StatusIcon = cfg.icon;
            return (
              <Link
                key={b.id}
                href="/tracking"
                className="card block p-4 hover:shadow-card-hover transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink truncate">{b.provider_name}</p>
                    <p className="text-sm text-ink-muted capitalize mt-0.5">{b.service_type}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shrink-0 ${cfg.color}`}
                  >
                    <StatusIcon size={12} />
                    {cfg.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold text-brand-700">
                    PKR {b.total_price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-ink-faint">
                    <Clock size={12} />
                    {new Date(b.created_at).toLocaleDateString("ur-PK")}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] font-mono text-ink-faint">#{b.booking_id || b.id}</p>
                  <ChevronRight size={16} className="text-ink-faint" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Link
        href="/dispute"
        className="mt-6 block text-center text-sm font-medium text-brand-700"
      >
        Masla hai? Complaint karein →
      </Link>
    </main>
  );
}
