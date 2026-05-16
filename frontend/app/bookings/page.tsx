"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBookings } from "@/lib/api";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    getBookings("demo-user-1").then((d) => setBookings(d.bookings || []));
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Booking History</h1>
      {bookings.length === 0 ? (
        <p className="text-white/60 text-sm">No bookings yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link key={String(b.id)} href="/tracking" className="block glass rounded-2xl p-4">
              <p className="font-medium">{String(b.provider_name)}</p>
              <p className="text-sm text-white/50">{String(b.service_type)} · {String(b.status)}</p>
              <p className="text-sm text-brand-300 mt-1">PKR {Number(b.total_price).toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
      <Link href="/dispute" className="mt-6 block text-center text-sm text-white/50 underline">
        File a dispute
      </Link>
    </main>
  );
}
