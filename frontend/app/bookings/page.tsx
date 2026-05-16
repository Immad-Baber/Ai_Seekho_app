"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBookings } from "@/lib/api";
import { CalendarDays } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    getBookings("demo-user-1").then((d) => setBookings(d.bookings || []));
  }, []);

  return (
    <main className="p-4">
      <h1 className="page-title mb-1">Meri bookings</h1>
      <p className="text-sm text-ink-muted mb-5">Purane aur active kaam</p>

      {bookings.length === 0 ? (
        <div className="card flex flex-col items-center py-12 text-center">
          <CalendarDays className="text-ink-faint mb-3" size={40} />
          <p className="font-medium text-ink">Abhi koi booking nahi</p>
          <p className="text-sm text-ink-muted mt-1">Pehla kaam book karein</p>
          <Link href="/" className="btn-primary mt-4">
            Naya kaam
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link key={String(b.id)} href="/tracking" className="card block p-4 hover:shadow-card-hover">
              <p className="font-bold text-ink">{String(b.provider_name)}</p>
              <p className="text-sm text-ink-muted capitalize">
                {String(b.service_type)} · {String(b.status)}
              </p>
              <p className="mt-2 text-lg font-bold text-brand-700">
                PKR {Number(b.total_price).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}

      <Link href="/dispute" className="mt-6 block text-center text-sm font-medium text-brand-700">
        Masla hai? Complaint karein →
      </Link>
    </main>
  );
}
