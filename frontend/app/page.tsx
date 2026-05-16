"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, Send, ChevronRight, MapPin, Shield, Clock, Sparkles } from "lucide-react";
import { orchestrate, runDemo, type OrchestrationResult } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { ServiceCategories } from "@/components/ServiceCategories";

const QUICK = [
  { text: "Mujhe kal subah AC service chahiye G-13", label: "AC" },
  { text: "Geyser leak ho raha hai urgent plumber chahiye", label: "Pani" },
  { text: "Sasta electrician chahiye paas mein", label: "Bijli" },
  { text: "Kal subah airport drop ke liye driver chahiye", label: "Drive" },
  { text: "Ghar ki safaii aur deep cleaning chahiye", label: "Safai" },
  { text: "Home beautician chahiye kal shaam facial ke liye", label: "Beauty" },
  { text: "Class 8 ke liye math tutor chahiye I-8 mein", label: "Tutor" },
  { text: "Car engine check ke liye mechanic chahiye", label: "Gari" },
  { text: "Washing machine pani leak kar rahi hai", label: "Machine" },
];

const TRUST = [
  { icon: Shield, text: "Verified ustaad" },
  { icon: Clock, text: "On-time guarantee" },
  { icon: MapPin, text: "Apke area mein" },
];

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState("");
  const [showDemos, setShowDemos] = useState(false);

  async function submit(text?: string) {
    const msg = text || message;
    if (!msg.trim()) return;
    setMessage(msg);
    setLoading(true);
    setError("");
    try {
      const res = await orchestrate(msg);
      setResult(res);
      sessionStorage.setItem("lastOrchestration", JSON.stringify(res));
    } catch {
      setError("Server se connect nahi ho raha. Backend start karein (port 8080).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col px-4 pt-5 pb-6">
      <header className="mb-5">
        <BrandLogo size="md" showTagline />
        <div className="mt-4 flex flex-wrap gap-2">
          {TRUST.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-800"
            >
              <Icon size={12} />
              {text}
            </span>
          ))}
        </div>
      </header>

      <section className="card-elevated mb-5 overflow-hidden p-0">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-white">
          <p className="text-sm font-semibold">Kya kaam karwana hai?</p>
          <p className="text-xs text-brand-100">Urdu, Roman Urdu ya English — jo marzi likhein</p>
        </div>
        <div className="p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Masalan: Kal subah G-13 mein plumber, electrician ya safai service chahiye..."
            className="input-field min-h-[88px] resize-none text-base"
            rows={3}
          />
          <div className="mt-3 flex gap-2">
            <Link href="/voice" className="btn-secondary flex-1 py-2.5">
              <Mic size={18} />
              Bol kar batao
            </Link>
            <button onClick={() => submit()} disabled={loading} className="btn-primary flex-[1.4] py-2.5">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles size={18} className="animate-pulse" />
                  Dhundh rahe hain...
                </span>
              ) : (
                <>
                  <Send size={18} />
                  Ustaad dhundo
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <p className="section-title mb-3">Service choose karein</p>
        <ServiceCategories onSelect={(p) => submit(p)} />
      </section>

      <section className="mb-5">
        <p className="section-title mb-2">Jaldi examples</p>
        <div className="flex flex-col gap-2">
          {QUICK.map(({ text, label }) => (
            <button
              key={text}
              type="button"
              onClick={() => submit(text)}
              disabled={loading}
              className="card flex items-center gap-3 p-3 text-left transition hover:border-brand-300 hover:shadow-card-hover active:scale-[0.99]"
            >
              <span className="min-w-12 rounded-full bg-brand-50 px-2 py-1 text-center text-[11px] font-bold text-brand-800">
                {label}
              </span>
              <span className="flex-1 text-sm font-medium text-ink leading-snug">{text}</span>
              <ChevronRight size={16} className="shrink-0 text-ink-faint" />
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => setShowDemos(!showDemos)}
        className="text-xs font-medium text-ink-faint underline mb-2"
      >
        {showDemos ? "Demo hide karein" : "Demo scenarios (testing)"}
      </button>
      {showDemos && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {[
            "ac-repair",
            "plumber-urgent",
            "electrician-wiring",
            "beautician-home",
            "tutor-math",
            "mechanic-car",
            "driver-airport",
            "cleaning-safai",
            "appliance-repair",
            "home-repair",
            "ambiguous-input",
            "schedule-conflict",
            "no-provider",
          ].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => runDemo(id).then((r) => {
                setResult(r);
                sessionStorage.setItem("lastOrchestration", JSON.stringify(r));
              })}
              className="chip justify-center text-[10px]"
            >
              {id}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 animate-fade-up"
          >
            <div className="card border-l-4 border-l-brand-500 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Samajh aa gaya · {result.intent.detected_language}
              </p>
              <p className="mt-1 text-lg font-bold text-ink capitalize">
                {result.intent.service_type || "Service"} · {result.intent.urgency}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {result.intent.location_text && (
                  <>
                    <MapPin size={14} className="inline mr-0.5 -mt-0.5" />
                    {result.intent.location_text} ·{" "}
                  </>
                )}
                {Math.round(result.intent.confidence * 100)}% sure
              </p>
              {result.intent.needs_clarification && (
                <ul className="mt-3 space-y-1 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                  {result.intent.clarification_questions.map((q, i) => (
                    <li key={i}>• {q}</li>
                  ))}
                </ul>
              )}
            </div>

            {result.selected_provider && (
              <div className="card-elevated border-2 border-brand-200 bg-brand-50/50 p-4">
                <p className="text-xs font-semibold text-brand-700">Aapka ustaad</p>
                <p className="text-xl font-bold text-ink">{result.selected_provider.name}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-white px-2.5 py-0.5 font-medium text-brand-800">
                    ★ {(result.selected_provider.total_score * 100).toFixed(0)}% match
                  </span>
                  {result.pricing && (
                    <span className="rounded-full bg-accent-100 px-2.5 py-0.5 font-bold text-accent-800">
                      PKR {result.pricing.total.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/summary", label: "Details", sub: "Poora summary" },
                { href: "/providers", label: "Ustaad", sub: "Sab options" },
                { href: "/pricing", label: "Qeemat", sub: "Breakdown" },
                { href: "/confirm", label: "Confirm", sub: "Book karein" },
                { href: "/reasoning", label: "AI samjhao", sub: "Kyun ye ustaad?" },
                { href: "/tracking", label: "Track", sub: "Live status" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="card flex flex-col p-3 transition hover:border-brand-300 hover:shadow-card-hover"
                >
                  <span className="font-semibold text-ink">{link.label}</span>
                  <span className="text-[11px] text-ink-muted">{link.sub}</span>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
