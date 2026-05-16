"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";
import { AgentTrace } from "@/components/AgentTrace";

export default function ReasoningPage() {
  const data = useOrchestration();
  return (
    <main className="p-4 pb-24">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/60 mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-2">AI Reasoning</h1>
      <p className="text-xs text-white/50 mb-4">Antigravity agent trace · {data?.trace_id}</p>
      {data?.workflow_chain && (
        <div className="glass rounded-xl p-3 mb-4 text-xs text-white/70 overflow-x-auto">
          {data.workflow_chain.join(" → ")}
        </div>
      )}
      {data?.traces ? <AgentTrace traces={data.traces} /> : <p className="text-white/60 text-sm">No traces yet.</p>}
      {data?.fallback_used && (
        <p className="mt-4 text-amber-400 text-sm">⚠ Fallback logic was used during orchestration</p>
      )}
    </main>
  );
}
