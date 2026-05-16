"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";

export default function ConfirmPage() {
  const data = useOrchestration();
  return (
    <main className="p-4 text-center">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/60 mb-4 float-left">
        <ArrowLeft size={16} /> Back
      </Link>
      <div className="clear-both pt-8">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed</h1>
        <p className="text-white/60 text-sm mb-6">{data?.booking_id || "Pending clarification"}</p>
        {data?.selected_provider && (
          <div className="glass rounded-2xl p-4 text-left mb-4">
            <p className="text-sm text-white/50">Provider</p>
            <p className="font-semibold">{data.selected_provider.name}</p>
            {data.schedule && (
              <p className="text-sm mt-2 text-brand-300">
                {new Date(data.schedule.start).toLocaleString()}
              </p>
            )}
          </div>
        )}
        <p className="text-xs text-white/40 mb-4">
          WhatsApp + FCM reminders scheduled · Calendar sync simulated
        </p>
        <Link href="/tracking" className="block py-3 rounded-xl bg-brand-600 font-medium mb-2">
          Live tracking
        </Link>
        <Link href="/feedback" className="block py-3 rounded-xl glass font-medium">
          Rate service
        </Link>
      </div>
    </main>
  );
}
