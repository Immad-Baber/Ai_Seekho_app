"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";
import { PageHeader } from "@/components/PageHeader";

export default function ConfirmPage() {
  const data = useOrchestration();
  return (
    <main className="p-4 text-center">
      <PageHeader title="Booking confirm!" subtitle="SMS aur WhatsApp alert bhej diya" />

      <CheckCircle2 className="mx-auto mb-4 h-20 w-20 text-brand-600" strokeWidth={1.5} />
      <p className="font-mono text-lg font-bold text-ink mb-6">
        {data?.booking_id || "Thodi der — details clear karein"}
      </p>

      {data?.selected_provider && (
        <div className="card mb-6 p-4 text-left">
          <p className="text-xs font-semibold text-ink-muted">Aapka ustaad</p>
          <p className="text-xl font-bold text-ink">{data.selected_provider.name}</p>
          {data.schedule && (
            <p className="mt-2 text-brand-700 font-medium">
              {new Date(data.schedule.start).toLocaleString("ur-PK")}
            </p>
          )}
        </div>
      )}

      <Link href="/tracking" className="btn-primary mb-3 block w-full">
        Live track karein
      </Link>
      <Link href="/feedback" className="btn-secondary block w-full">
        Baad mein rating dein
      </Link>
    </main>
  );
}
