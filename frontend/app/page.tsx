"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic, Send, ChevronRight, MapPin, Shield, Clock, Sparkles,
  UserCircle, CheckCircle2, Bot, Zap, BarChart2,
} from "lucide-react";
import { orchestrate, runDemo, type OrchestrationResult } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { ServiceCategories } from "@/components/ServiceCategories";
import { getUser, saveBooking, addNotification, getAllProviders, saveProviderJob, type ProviderJob } from "@/lib/auth";

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
  { icon: Clock,  text: "On-time guarantee" },
  { icon: MapPin, text: "Apke area mein" },
];

// AI reasoning steps shown while booking is being auto-confirmed
const AI_STEPS = [
  "Problem samajh aa gaya...",
  "Best ustaad dhundh raha hai...",
  "8 factors se score kar raha hai...",
  "Qeemat calculate ho rahi hai...",
  "Ustaad ko assign kar raha hai...",
  "Booking confirm kar raha hai...",
  "Notification bhej raha hai...",
];

export default function HomePage() {
  const router = useRouter();
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<OrchestrationResult | null>(null);
  const [error, setError]       = useState("");
  const [showDemos, setShowDemos] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [userName, setUserName] = useState("");
  const [aiStep, setAiStep]     = useState(0);
  const [autoBooked, setAutoBooked] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) { router.push("/select-role"); return; }
    if (u.role === "provider") { router.push("/provider"); return; }
    setUserName(u.name.split(" ")[0]);
  }, [router]);

  // Auto-save booking once result arrives
  useEffect(() => {
    if (!result || autoBooked) return;
    const user = getUser();
    if (!user) return;

    const bookingId = result.booking_id || `BK-${Date.now()}`;
    const serviceType = result.intent?.service_type || "Service";
    const providerName = result.selected_provider?.name || "Ustaad";

    saveBooking(user.phone, {
      id: bookingId,
      booking_id: bookingId,
      provider_name: providerName,
      service_type: serviceType,
      status: "confirmed",
      total_price: result.pricing?.total || 0,
      created_at: new Date().toISOString(),
      schedule_start: result.schedule?.start,
    });
    addNotification(user.phone, {
      title: "✅ Booking Confirm Ho Gayi!",
      body: `${providerName} aapke pass aa raha hai. Booking ID: ${bookingId}`,
    });
    
    // Simulate Follow-Up Automation (Requirement 6)
    // Add these to the feed so the user can see the automation working
    setTimeout(() => {
      addNotification(user.phone, {
        title: "⏰ Reminder: Ustaad aa raha hai",
        body: `Aapka ustaad ${providerName} 1 ghante mein pahuchega. Tayar rahein!`,
      });
    }, 2000);

    // ── Create a job for matching providers ──
    // Map service type to provider domain
    const serviceLower = serviceType.toLowerCase();
    const domainMap: Record<string, string[]> = {
      "Electrician": ["electric", "wiring", "fan", "bijli", "switch", "light"],
      "Plumber": ["plumb", "geyser", "leak", "pani", "pipe", "tap"],
      "AC Technician": ["ac", "air condition", "cooling", "gas refill", "ac_repair", "ac_service"],
      "Home Cleaning": ["clean", "safai", "deep clean"],
      "Home Beautician": ["beauty", "beautician", "facial", "makeup"],
      "Tutor": ["tutor", "teach", "class", "math", "english"],
      "Mechanic": ["mechanic", "car", "engine", "gari", "vehicle"],
      "Carpenter": ["carpenter", "furniture", "door", "wood"],
      "Painter": ["paint", "wall", "color"],
      "Driver": ["driver", "airport", "drop", "pick"],
    };

    let matchDomain = "";
    for (const [domain, keywords] of Object.entries(domainMap)) {
      if (keywords.some((kw) => serviceLower.includes(kw))) {
        matchDomain = domain;
        break;
      }
    }

    // Find matching providers and assign job to them
    if (matchDomain) {
      const providers = getAllProviders();
      const matchingProviders = providers.filter(
        (p) => (p.domain || "").toLowerCase() === matchDomain.toLowerCase()
      );

      matchingProviders.forEach((provider) => {
        const job: ProviderJob = {
          id: `J-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          service: serviceType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          area: result.intent?.location_text || user.address || "Islamabad",
          time: result.schedule?.start
            ? new Date(result.schedule.start).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
            : "10:00 AM",
          pay: result.pricing?.total || 2000,
          status: "auto-assigned",
          customer: user.name,
          customerPhone: user.phone,
          bookingId,
          assignedAt: new Date().toISOString(),
          domain: matchDomain,
        };
        saveProviderJob(provider.phone, job);

        // Notify the provider
        addNotification(provider.phone, {
          title: "🔔 Naya Kaam Assign Hua!",
          body: `${serviceType} — ${user.name} ne booking ki hai. Booking ID: ${bookingId}`,
        });
      });
    }

    setAutoBooked(true);
  }, [result, autoBooked]);

  async function submit(text?: string) {
    const msg = text || message;
    if (!msg.trim()) return;
    setMessage(msg);
    setLoading(true);
    setError("");
    setResult(null);
    setAutoBooked(false);
    setAiStep(0);

    // Animate AI reasoning steps
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < AI_STEPS.length) setAiStep(stepIdx);
      else clearInterval(stepInterval);
    }, 400);

    try {
      const res = await orchestrate(msg);
      clearInterval(stepInterval);
      setAiStep(AI_STEPS.length - 1);
      setResult(res);
      sessionStorage.setItem("lastOrchestration", JSON.stringify(res));
    } catch {
      clearInterval(stepInterval);
      setError("Server se connect nahi ho raha. Backend start karein (port 8080).");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col px-4 pt-5 pb-6">
      {/* Header */}
      <header className="mb-5 flex items-start justify-between">
        <div>
          <BrandLogo size="md" showTagline />
          {userName && (
            <p className="mt-2 text-sm font-semibold text-ink-muted">
              Assalam-o-Alaikum, <span className="text-brand-600">{userName}</span> 👋
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {TRUST.map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-800">
                <Icon size={12} /> {text}
              </span>
            ))}
          </div>
        </div>
        <Link href="/profile" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 hover:bg-brand-200 transition">
          <UserCircle size={22} />
        </Link>
      </header>

      {/* Input Card */}
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
              <Mic size={18} /> Bol kar batao
            </Link>
            <button onClick={() => submit()} disabled={loading} className="btn-primary flex-[1.4] py-2.5">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles size={18} className="animate-pulse" />
                  Dhundh rahe hain...
                </span>
              ) : (
                <><Send size={18} /> Ustaad dhundo</>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* AI Reasoning Steps — shown while loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white"
          >
            <div className="flex items-center gap-2 mb-3">
              <Bot size={16} className="animate-pulse" />
              <p className="font-bold text-sm">AI Agent kaam kar raha hai...</p>
            </div>
            <div className="space-y-1.5">
              {AI_STEPS.map((step, i) => (
                <div key={step} className={`flex items-center gap-2 text-xs transition-all duration-300 ${i <= aiStep ? "opacity-100" : "opacity-30"}`}>
                  {i < aiStep ? (
                    <CheckCircle2 size={12} className="text-green-300 shrink-0" />
                  ) : i === aiStep ? (
                    <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-white/40 shrink-0" />
                  )}
                  <span className={i <= aiStep ? "text-white font-medium" : "text-brand-100"}>{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && !result && (
        <>
          <section className="mb-5">
            <p className="section-title mb-3">Service choose karein</p>
            <ServiceCategories onSelect={(p) => submit(p)} />
          </section>

          <section className="mb-5">
            <p className="section-title mb-2">Jaldi examples</p>
            <div className="flex flex-col gap-2">
              {QUICK.map(({ text, label }) => (
                <button key={text} type="button" onClick={() => submit(text)} disabled={loading}
                  className="card flex items-center gap-3 p-3 text-left transition hover:border-brand-300 hover:shadow-card-hover active:scale-[0.99]">
                  <span className="min-w-12 rounded-full bg-brand-50 px-2 py-1 text-center text-[11px] font-bold text-brand-800">{label}</span>
                  <span className="flex-1 text-sm font-medium text-ink leading-snug">{text}</span>
                  <ChevronRight size={16} className="shrink-0 text-ink-faint" />
                </button>
              ))}
            </div>
          </section>

          <button type="button" onClick={() => setShowDemos(!showDemos)}
            className="text-xs font-medium text-ink-faint underline mb-2">
            {showDemos ? "Demo hide karein" : "Demo scenarios (testing)"}
          </button>
          {showDemos && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {["ac-repair","plumber-urgent","electrician-wiring","beautician-home","tutor-math",
                "mechanic-car","driver-airport","cleaning-safai","appliance-repair","home-repair",
                "ambiguous-input","schedule-conflict","no-provider"].map((id) => (
                <button key={id} type="button"
                  onClick={() => runDemo(id).then((r) => { setResult(r); sessionStorage.setItem("lastOrchestration", JSON.stringify(r)); })}
                  className="chip justify-center text-[10px]">{id}</button>
              ))}
            </div>
          )}
        </>
      )}

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Auto-booked result — no manual confirm needed */}
      <AnimatePresence>
        {result && !loading && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

            {/* ✅ Auto-confirm banner */}
            <div className="rounded-2xl bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">AI ne automatically book kar diya! ✅</p>
                  <p className="text-xs text-green-100 mt-0.5">
                    Aapko kuch karne ki zaroorat nahi — ustaad assign ho gaya
                  </p>
                </div>
              </div>
            </div>

            {/* Intent */}
            <div className="card border-l-4 border-l-brand-500 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Samajh aa gaya · {result.intent.detected_language}
              </p>
              <p className="mt-1 text-lg font-bold text-ink capitalize">
                {result.intent.service_type || "Service"} · {result.intent.urgency}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {result.intent.location_text && (
                  <><MapPin size={14} className="inline mr-0.5 -mt-0.5" />{result.intent.location_text} · </>
                )}
                {Math.round(result.intent.confidence * 100)}% sure
              </p>
              {result.intent.needs_clarification && (
                <ul className="mt-3 space-y-1 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                  {result.intent.clarification_questions.map((q, i) => (<li key={i}>• {q}</li>))}
                </ul>
              )}
            </div>

            {/* Provider */}
            {result.selected_provider && (
              <div className="card-elevated border-2 border-green-200 bg-green-50/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <p className="text-xs font-semibold text-green-700">Aapka ustaad assign ho gaya</p>
                </div>
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
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 font-bold text-green-800 flex items-center gap-1">
                    <Bot size={11} /> Auto-confirmed
                  </span>
                </div>
              </div>
            )}

            {/* Action links */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/receipt",      label: "Receipt",    sub: "Booking details",  icon: CheckCircle2 },
                { href: "/tracking",     label: "Track",      sub: "Live status",      icon: MapPin },
                { href: "/reasoning",    label: "AI samjhao", sub: "Kyun ye ustaad?",  icon: Bot },
                { href: "/providers",    label: "Ustaad",     sub: "Sab options",      icon: UserCircle },
                { href: "/summary",      label: "Details",    sub: "Poora summary",    icon: BarChart2 },
                { href: "/bookings",     label: "Bookings",   sub: "Meri history",     icon: Shield },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}
                    className="card flex flex-col p-3 transition hover:border-brand-300 hover:shadow-card-hover">
                    <span className="flex items-center gap-1.5 font-semibold text-ink text-sm">
                      <Icon size={14} className="text-brand-500" />
                      {link.label}
                    </span>
                    <span className="text-[11px] text-ink-muted mt-0.5">{link.sub}</span>
                  </Link>
                );
              })}
            </div>

            {/* New request button */}
            <button
              onClick={() => { setResult(null); setMessage(""); setAutoBooked(false); }}
              className="w-full rounded-2xl border-2 border-dashed border-stone-300 py-3 text-sm font-semibold text-ink-muted hover:border-brand-400 hover:text-brand-600 transition"
            >
              + Naya kaam karwana hai
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
