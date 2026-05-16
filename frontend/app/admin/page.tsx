"use client";

import { useEffect, useState } from "react";
import { getTraces } from "@/lib/api";
import { AgentTrace } from "@/components/AgentTrace";
import { Activity } from "lucide-react";

export default function AdminDashboard() {
  const [traces, setTraces] = useState<Array<Record<string, unknown>>>([]);
  const metrics = {
    orchestrations: 1247,
    successRate: 94.2,
    avgConfidence: 87,
    fallbacks: 23,
  };

  useEffect(() => {
    getTraces(20).then((d) => setTraces(d.traces || []));
  }, []);

  return (
    <main className="p-4 pb-24">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="text-brand-600" size={24} />
        <h1 className="page-title">Admin panel</h1>
      </div>
      <p className="text-sm text-ink-muted mb-6">AI decisions & system health</p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {[
          ["Orchestrations", metrics.orchestrations],
          ["Success", `${metrics.successRate}%`],
          ["Confidence", `${metrics.avgConfidence}%`],
          ["Fallbacks", metrics.fallbacks],
        ].map(([label, value]) => (
          <div key={String(label)} className="card p-3 text-center">
            <p className="text-2xl font-bold text-brand-700">{value}</p>
            <p className="text-[11px] text-ink-muted font-medium">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title mb-2">System</h2>
      <div className="card mb-6 space-y-2 p-4 text-sm">
        <Status ok label="API" />
        <Status ok label="Ustaad AI" />
        <Status warn label="Vertex AI" detail="Demo mode" />
      </div>

      <h2 className="section-title mb-2">Recent traces</h2>
      {traces.length === 0 ? (
        <p className="text-ink-muted text-sm">Abhi koi trace nahi.</p>
      ) : (
        traces.slice(-3).map((t, i) => (
          <div key={i} className="card mb-2 p-3 text-xs">
            <p className="font-mono text-brand-700">{String(t.trace_id)}</p>
            <p className="text-ink-muted truncate">{String(t.message)}</p>
          </div>
        ))
      )}

      <h2 className="section-title mt-6 mb-2">Live session</h2>
      <SessionTrace />
    </main>
  );
}

function Status({ ok, warn, label, detail }: { ok?: boolean; warn?: boolean; label: string; detail?: string }) {
  return (
    <div className="flex justify-between">
      <span className={ok ? "text-green-700 font-medium" : warn ? "text-amber-700" : "text-red-700"}>
        ● {label}
      </span>
      {detail && <span className="text-ink-faint">{detail}</span>}
    </div>
  );
}

function SessionTrace() {
  const [data, setData] = useState<{ traces: Parameters<typeof AgentTrace>[0]["traces"] } | null>(null);
  useEffect(() => {
    const raw = sessionStorage.getItem("lastOrchestration");
    if (raw) setData(JSON.parse(raw));
  }, []);
  if (!data?.traces) return <p className="text-ink-muted text-sm">Koi active session nahi</p>;
  return <AgentTrace traces={data.traces} />;
}
