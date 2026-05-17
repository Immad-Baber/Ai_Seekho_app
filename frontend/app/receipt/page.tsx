"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, Receipt as ReceiptIcon, User, Bot, MapPin, Calendar, Clock, CreditCard } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";

export default function ReceiptPage() {
  const data = useOrchestration();
  const [userName, setUserName] = useState("Customer");

  useEffect(() => {
    const u = getUser();
    if (u) setUserName(u.name);
  }, []);

  if (!data) {
    return (
      <main className="p-4">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-4">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="card text-center py-10">
          <p className="font-semibold text-ink">No booking found</p>
        </div>
      </main>
    );
  }

  const { intent, selected_provider, pricing, schedule, booking_id } = data;

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 pb-20">
      {/* Header */}
      <header className="bg-brand-700 text-white px-4 pt-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-1 text-sm font-medium text-brand-100 hover:text-white transition">
            <ArrowLeft size={16} /> Back
          </Link>
          <button className="flex items-center gap-1.5 text-sm font-medium text-brand-100 hover:text-white transition">
            <Download size={16} /> Save PDF
          </button>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-400 text-brand-900 shadow-lg shadow-green-500/20">
            <CheckCircle2 size={24} />
          </div>
          <h1 className="font-display text-2xl font-bold">Booking Confirmed</h1>
          <p className="text-brand-100 mt-1 opacity-90">Thank you for choosing Antigravity</p>
        </div>
      </header>

      {/* Receipt Card */}
      <div className="mx-4 -mt-6">
        <div className="rounded-2xl bg-white shadow-xl shadow-stone-200/50 overflow-hidden">
          
          {/* Top section: ID & Status */}
          <div className="border-b border-dashed border-stone-200 p-5 bg-stone-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-ink-muted">
                <ReceiptIcon size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">Receipt</span>
              </div>
              <span className="rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Confirmed
              </span>
            </div>
            <p className="text-2xl font-mono font-bold text-ink tracking-tight">{booking_id || "BK-PENDING"}</p>
            <p className="text-xs text-ink-muted mt-1">{new Date().toLocaleString()}</p>
          </div>

          {/* Details */}
          <div className="p-5 space-y-5">
            {/* Service & Provider */}
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-3">Service Details</p>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-bold text-ink text-base">{selected_provider?.name || "Ustaad"}</p>
                  <p className="text-sm text-ink-muted capitalize">{intent.service_type || "Service"}</p>
                </div>
              </div>
            </div>

            {/* Location & Time */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wide flex items-center gap-1 mb-1"><MapPin size={12}/> Location</p>
                <p className="text-sm font-semibold text-ink line-clamp-2">{intent.location_text || "Islamabad"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wide flex items-center gap-1 mb-1"><Calendar size={12}/> Date & Time</p>
                <p className="text-sm font-semibold text-ink">
                  {schedule?.start ? new Date(schedule.start).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) : intent.time_preference || "As soon as possible"}
                </p>
              </div>
            </div>

            {/* AI Decision Summary */}
            <div className="rounded-xl bg-purple-50 p-3 border border-purple-100">
              <p className="text-xs font-bold text-purple-800 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Bot size={14} /> AI Decision Summary
              </p>
              <p className="text-xs text-purple-700 leading-relaxed">
                Provider selected based on <strong>{(selected_provider?.total_score || 0) * 100}% match</strong>. Ranked #1 for distance ({selected_provider?.distance_km || "nearby"} km), availability, and rating.
              </p>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="border-t border-dashed border-stone-200 bg-stone-50/50 p-5">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wide flex items-center gap-1.5 mb-4">
              <CreditCard size={14} /> Payment Summary
            </p>
            
            <div className="space-y-2 mb-4">
              {pricing?.line_items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-ink-muted">{item.label}</span>
                  <span className="font-medium text-ink">PKR {item.amount.toLocaleString()}</span>
                </div>
              )) || (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Estimated Base Fare</span>
                  <span className="font-medium text-ink">PKR {pricing?.total?.toLocaleString() || 2000}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-end border-t border-stone-200 pt-3">
              <span className="font-bold text-ink">Total Amount</span>
              <span className="text-xl font-bold text-brand-700">PKR {pricing?.total?.toLocaleString() || 2000}</span>
            </div>
            <p className="text-center text-[10px] text-ink-faint mt-4 uppercase tracking-widest font-mono">
              Cash on completion
            </p>
          </div>

        </div>
      </div>

      {/* Track CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-stone-200">
        <Link href="/tracking" className="btn-primary w-full py-3.5 text-base shadow-lg shadow-brand-500/30">
          Track Provider Live <ArrowLeft size={18} className="rotate-180" />
        </Link>
      </div>

    </main>
  );
}
