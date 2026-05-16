"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, Send, Sparkles, ChevronRight } from "lucide-react";
import { orchestrate, runDemo, type OrchestrationResult } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const QUICK = [
  "Mujhe kal morning AC service chahiye G-13",
  "Geyser leak kar raha urgent",
  "Cheap electrician near G-13",
  "Machine pani leak kr rhi",
];

const DEMOS = [
  { id: "ac-repair", label: "AC repair" },
  { id: "ambiguous-input", label: "Ambiguous input" },
  { id: "schedule-conflict", label: "Schedule conflict" },
  { id: "price-dispute", label: "Price dispute" },
  { id: "no-provider", label: "No provider" },
  { id: "provider-cancel", label: "Provider cancel" },
];

export default function ChatHome() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState("");

  async function submit(text?: string) {
    const msg = text || message;
    if (!msg.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await orchestrate(msg);
      setResult(res);
      sessionStorage.setItem("lastOrchestration", JSON.stringify(res));
    } catch {
      setError("API unavailable. Start backend: cd backend && uvicorn app.main:app --port 8080");
    } finally {
      setLoading(false);
    }
  }

  async function demo(id: string) {
    setLoading(true);
    setError("");
    try {
      const res = await runDemo(id);
      setResult(res);
      sessionStorage.setItem("lastOrchestration", JSON.stringify(res));
    } catch {
      setError("Demo failed — ensure API is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col min-h-screen p-4">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">ServiceFlow AI</h1>
            <p className="text-xs text-white/50">Antigravity Orchestrator · Urdu/English</p>
          </div>
        </div>
      </header>

      <section className="glass rounded-2xl p-4 mb-4">
        <p className="text-sm text-white/70 mb-3">
          Describe your service need in any language — Roman Urdu, Urdu, or English.
        </p>
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mujhe kal morning AC service chahiye..."
            className="flex-1 bg-surface-800 rounded-xl px-3 py-2 text-sm resize-none h-20 border border-white/10 focus:border-brand-500 outline-none"
          />
        </div>
        <motion.div className="flex gap-2 mt-3">
          <Link
            href="/voice"
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-700 text-sm"
          >
            <Mic size={16} /> Voice
          </Link>
          <button
            onClick={() => submit()}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 font-medium text-sm"
          >
            {loading ? "Orchestrating..." : <><Send size={16} /> Orchestrate</>}
          </button>
        </motion.div>
      </section>

      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => {
              setMessage(q);
              submit(q);
            }}
            className="text-xs px-3 py-1.5 rounded-full bg-surface-700/80 border border-white/10 hover:border-brand-500/50"
          >
            {q.slice(0, 28)}…
          </button>
        ))}
      </div>

      <p className="text-xs text-white/40 mb-2">Demo workflows</p>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {DEMOS.map((d) => (
          <button
            key={d.id}
            onClick={() => demo(d.id)}
            disabled={loading}
            className="text-left text-xs glass rounded-xl p-3 hover:border-brand-500/30 border border-transparent"
          >
            {d.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-brand-300 mb-1">Intent · {result.intent.detected_language}</p>
              <p className="font-medium">{result.intent.service_type || "—"} · {result.intent.urgency}</p>
              <p className="text-sm text-white/60 mt-1">
                Confidence {Math.round(result.intent.confidence * 100)}%
                {result.intent.location_text && ` · ${result.intent.location_text}`}
              </p>
              {result.intent.needs_clarification && (
                <ul className="mt-2 text-sm text-amber-300/90 list-disc pl-4">
                  {result.intent.clarification_questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              )}
            </div>

            {result.selected_provider && (
              <div className="glass rounded-2xl p-4 border border-brand-500/30">
                <p className="text-xs text-white/50">Selected provider</p>
                <p className="font-semibold text-lg">{result.selected_provider.name}</p>
                <p className="text-sm text-brand-300">
                  Score {(result.selected_provider.total_score * 100).toFixed(0)}%
                </p>
              </div>
            )}

            {result.pricing && (
              <p className="text-sm glass rounded-xl px-4 py-2">
                Total <span className="font-bold text-brand-300">PKR {result.pricing.total.toLocaleString()}</span>
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/summary", label: "Summary" },
                { href: "/providers", label: "Providers" },
                { href: "/reasoning", label: "AI Reasoning" },
                { href: "/pricing", label: "Pricing" },
                { href: "/confirm", label: "Confirm" },
                { href: "/tracking", label: "Live Track" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between glass rounded-xl px-3 py-2 text-sm"
                >
                  {link.label}
                  <ChevronRight size={14} className="text-white/40" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
