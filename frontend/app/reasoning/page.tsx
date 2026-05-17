"use client";

import Link from "next/link";
import { ArrowLeft, GitMerge, Search, Target, Zap, Shield, FileCheck, CheckCircle2 } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";
import { AgentTrace } from "@/components/AgentTrace";
import { useState } from "react";

export default function ReasoningPage() {
  const data = useOrchestration();
  const [activePhase, setActivePhase] = useState<string | null>(null);

  if (!data) {
    return (
      <main className="p-4">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-4">
          <ArrowLeft size={16} /> Back
        </Link>
        <p>No orchestration data available.</p>
      </main>
    );
  }

  // Group traces into the 4 phases
  const PHASES = [
    { id: "planning", label: "1. Planning & Understanding", icon: Search, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { id: "decision", label: "2. Matching & Decision", icon: Target, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { id: "action", label: "3. Action & Booking", icon: Zap, color: "text-green-600 bg-green-50 border-green-200" },
    { id: "followup", label: "4. Follow-up Automation", icon: Shield, color: "text-purple-600 bg-purple-50 border-purple-200" },
  ];

  const getPhaseForAgent = (agentName: string) => {
    const name = agentName.toLowerCase();
    if (name.includes("language") || name.includes("intent") || name.includes("risk")) return "planning";
    if (name.includes("matching") || name.includes("pricing")) return "decision";
    if (name.includes("booking") || name.includes("scheduling")) return "action";
    return "followup"; // notification, reputation, escalation, etc.
  };

  const groupedTraces = data.traces.reduce((acc, trace) => {
    const phase = getPhaseForAgent(trace.agent);
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(trace);
    return acc;
  }, {} as Record<string, typeof data.traces>);

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 pb-20">
      <div className="bg-brand-700 text-white px-4 pt-6 pb-12">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-100 hover:text-white transition mb-4">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <h1 className="text-2xl font-display font-bold">AI Reasoning Pipeline</h1>
        <p className="text-brand-100 mt-1">Trace ID: {data.trace_id}</p>
      </div>

      <div className="mx-4 -mt-6">
        <div className="rounded-2xl bg-white shadow-xl shadow-stone-200/50 p-5 mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-4 flex items-center gap-2">
            <GitMerge size={14} /> Agentic Workflow Chain
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] font-mono text-ink-muted">
            {data.workflow_chain.map((agent, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="bg-stone-100 px-2 py-1 rounded border border-stone-200">{agent}</span>
                {i < data.workflow_chain.length - 1 && <span className="text-stone-300">→</span>}
              </span>
            ))}
          </div>
          {data.fallback_used && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
              <Shield size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium leading-relaxed">
                Fallback engaged during workflow execution. Primary model or tool was unavailable.
              </p>
            </div>
          )}
        </div>

        <h2 className="font-bold text-lg text-ink mb-4 pl-1">Execution Trace logs</h2>
        
        <div className="space-y-4">
          {PHASES.map((phase) => {
            const traces = groupedTraces[phase.id] || [];
            const PhaseIcon = phase.icon;
            
            return (
              <div key={phase.id} className="card p-4 overflow-hidden border border-stone-200">
                <div 
                  className={`flex items-center gap-3 p-3 rounded-xl border ${phase.color} mb-4 cursor-pointer`}
                  onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
                >
                  <PhaseIcon size={18} />
                  <p className="font-bold text-sm flex-1">{phase.label}</p>
                  <div className="text-xs font-bold rounded-full bg-white/50 px-2 py-0.5">
                    {traces.length} traces
                  </div>
                </div>

                <div className="pl-4 border-l-2 border-stone-100 space-y-4 py-2">
                  {traces.length === 0 ? (
                    <p className="text-xs text-ink-faint italic">No traces in this phase</p>
                  ) : (
                    traces.map((t, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-stone-300" />
                        
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-xs font-bold text-ink">{t.agent}</span>
                          {t.confidence != null && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold text-green-800 flex items-center gap-1">
                              <CheckCircle2 size={10} /> {(t.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-ink-muted leading-relaxed">{t.message}</p>
                        
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[9px] font-mono text-stone-500 uppercase">
                            Action: {t.action}
                          </span>
                          {t.details?.tool_used && (
                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-mono text-blue-600 uppercase flex items-center gap-1">
                              <FileCheck size={10} /> Tool: {t.details.tool_used}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
