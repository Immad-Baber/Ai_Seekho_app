"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Truck, CheckCircle2, Star, MessageSquare } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";
import { getUser, addNotification } from "@/lib/auth";

const STEPS = ["confirmed", "provider_assigned", "en_route", "arrived", "in_progress", "completed"];

export default function TrackingPage() {
  const data = useOrchestration();
  const [step, setStep] = useState(2);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Automatically advance the tracking steps
    const t = setInterval(() => {
      setStep((s) => {
        const nextStep = Math.min(s + 1, STEPS.length - 1);
        if (nextStep === 3 && s === 2) {
          // Send notification when arrived
          const user = getUser();
          if (user) {
            addNotification(user.phone, {
              title: "📍 Ustaad Puhanch Gaya!",
              body: `${data?.selected_provider?.name || "Ustaad"} aapki location par hai.`,
            });
          }
        }
        return nextStep;
      });
    }, 4000);
    return () => clearInterval(t);
  }, [data]);

  const handleMarkComplete = () => {
    setIsCompleted(true);
    setStep(STEPS.length - 1);
    const user = getUser();
    if (user) {
      addNotification(user.phone, {
        title: "⭐ Kaam Mukammal!",
        body: `Aapka service complete ho gaya hai. Kripya apna feedback dein.`,
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 pb-20">
      <div className="bg-brand-700 text-white px-4 pt-6 pb-12">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-100 hover:text-white transition mb-4">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <h1 className="text-2xl font-display font-bold">Live Tracking</h1>
        <p className="text-brand-100 mt-1">Provider ki status dekhein</p>
      </div>

      <div className="mx-4 -mt-6">
        <div className="rounded-2xl bg-white shadow-xl shadow-stone-200/50 p-6 mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent pointer-events-none" />
          <Truck className="w-12 h-12 text-brand-600 mx-auto mb-2 relative" />
          <p className="text-center font-bold text-lg relative text-ink">
            {data?.selected_provider?.name || "Provider"} is {STEPS[step].replace("_", " ")}
          </p>
          <p className="text-center text-sm font-semibold text-brand-600 mt-1 relative">
            {step < STEPS.length - 1 ? `ETA ~${data?.matches?.[0]?.eta_minutes || 25} min` : "Service Complete"}
          </p>
        </div>

        <div className="card p-4 space-y-3 mb-6">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                i === step ? "bg-brand-50 border border-brand-200 shadow-sm" : 
                i < step ? "bg-green-50/50" : "bg-stone-50 opacity-50"
              }`}
            >
              {i < step ? (
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              ) : i === step ? (
                <div className="h-4 w-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin shrink-0 ml-0.5" />
              ) : (
                <MapPin size={18} className="text-ink-faint shrink-0" />
              )}
              <span className={`text-sm font-medium capitalize ${
                i === step ? "text-brand-800" : i < step ? "text-green-800" : "text-ink-muted"
              }`}>
                {s.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>

        {/* Completion Flow */}
        {(step === STEPS.length - 1 || step === STEPS.length - 2) && !isCompleted && (
          <div className="animate-fade-up">
            <button
              onClick={handleMarkComplete}
              className="btn-primary w-full py-4 text-base shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} /> Mark Service as Complete
            </button>
            <p className="text-center text-xs text-ink-muted mt-3">
              Only mark as complete when the Ustaad has finished the job.
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="card border-2 border-green-200 bg-green-50 p-5 text-center animate-fade-up">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <p className="font-bold text-lg text-green-800 mb-1">Service Complete!</p>
            <p className="text-sm text-green-700 mb-4">Please rate your experience with {data?.selected_provider?.name || "the provider"}.</p>
            
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="text-amber-400 hover:scale-110 transition">
                  <Star size={32} fill="currentColor" />
                </button>
              ))}
            </div>
            
            <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white border border-green-200 text-green-700 font-semibold hover:bg-green-100 transition">
              <MessageSquare size={16} /> Leave a Review
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
