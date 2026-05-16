"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Truck } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";

const STEPS = ["confirmed", "provider_assigned", "en_route", "arrived", "in_progress", "completed"];

export default function TrackingPage() {
  const data = useOrchestration();
  const [step, setStep] = useState(2);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="p-4">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/60 mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Live Tracking</h1>
      <div className="glass rounded-2xl p-6 mb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent" />
        <Truck className="w-12 h-12 text-brand-400 mx-auto mb-2 relative" />
        <p className="text-center font-medium relative">
          {data?.selected_provider?.name || "Provider"} is {STEPS[step].replace("_", " ")}
        </p>
        <p className="text-center text-xs text-white/50 mt-1 relative">ETA ~{data?.matches?.[0]?.eta_minutes || 25} min</p>
      </div>
      <div className="space-y-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-3 p-3 rounded-xl ${i <= step ? "bg-brand-600/20 border border-brand-500/30" : "glass opacity-50"}`}
          >
            <MapPin size={16} className={i <= step ? "text-brand-400" : "text-white/30"} />
            <span className="text-sm capitalize">{s.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
