"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CalendarDays, Package } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";
import { PageHeader } from "@/components/PageHeader";
import { getUser, saveBooking, addNotification } from "@/lib/auth";

export default function ConfirmPage() {
  const data = useOrchestration();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data || saved) return;
    const user = getUser();
    if (!user) return;

    const bookingId = data.booking_id || `BK-${Date.now()}`;

    // Save booking under the logged-in user
    saveBooking(user.phone, {
      id: bookingId,
      booking_id: bookingId,
      provider_name: data.selected_provider?.name || "Unknown Provider",
      service_type: data.intent?.service_type || "Service",
      status: "confirmed",
      total_price: data.pricing?.total || 0,
      created_at: new Date().toISOString(),
      schedule_start: data.schedule?.start,
    });

    // Add a notification for this user
    addNotification(user.phone, {
      title: "✅ Booking Confirm Ho Gayi!",
      body: `${data.selected_provider?.name || "Ustaad"} aapke pass aa raha hai. Booking ID: ${bookingId}`,
    });

    setSaved(true);
  }, [data, saved]);

  return (
    <main className="p-4 text-center">
      <PageHeader title="Booking confirm!" subtitle="SMS aur WhatsApp alert bhej diya" />

      <CheckCircle2 className="mx-auto mb-4 h-20 w-20 text-brand-600" strokeWidth={1.5} />

      <p className="font-mono text-lg font-bold text-ink mb-2">
        {data?.booking_id || "Thodi der — details clear karein"}
      </p>

      {saved && (
        <p className="text-xs text-green-600 font-medium mb-6 flex items-center justify-center gap-1">
          <CheckCircle2 size={13} /> Booking aapki history mein save ho gayi
        </p>
      )}

      {data?.selected_provider && (
        <div className="card mb-6 p-4 text-left">
          <p className="text-xs font-semibold text-ink-muted">Aapka ustaad</p>
          <p className="text-xl font-bold text-ink">{data.selected_provider.name}</p>
          {data.schedule && (
            <p className="mt-2 text-brand-700 font-medium">
              {new Date(data.schedule.start).toLocaleString("ur-PK")}
            </p>
          )}
          {data.pricing && (
            <p className="mt-2 text-lg font-bold text-accent-700">
              PKR {data.pricing.total.toLocaleString()}
            </p>
          )}
        </div>
      )}

      <Link href="/tracking" className="btn-primary mb-3 block w-full">
        Live track karein
      </Link>
      <Link href="/bookings" className="btn-secondary mb-3 block w-full flex items-center justify-center gap-2">
        <Package size={16} /> Meri Bookings
      </Link>
      <Link href="/feedback" className="block text-center text-sm font-medium text-brand-700">
        <CalendarDays size={14} className="inline mr-1 -mt-0.5" />
        Baad mein rating dein
      </Link>
    </main>
  );
}
