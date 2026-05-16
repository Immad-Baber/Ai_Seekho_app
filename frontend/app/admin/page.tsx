"use client";

import { useEffect, useState } from "react";
import { getTraces } from "@/lib/api";
import { AgentTrace } from "@/components/AgentTrace";

export default function AdminDashboard() {
  const [traces, setTraces] = useState<Array<Record<string, unknown>>>([]);
  const [metrics] = useState({
    orchestrations: 1247,
    successRate: 94.2,
    avgConfidence: 0.87,
    fallbacks: 23,
    disputes: 8,
  });

  useEffect(() => {
    getTraces(20).then((d) => setTraces(d.traces || []));
  }, []);

  return (
    <main className="p-4 pb-24">
      <h1 className="text-xl font-bold mb-1">AI Monitoring</h1>
      <p className="text-xs text-white/50 mb-6">Antigravity · Cloud Logging · Workflows</p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <Metric label="Orchestrations" value={String(metrics.orchestrations)} />
        <Metric label="Success %" value={`${metrics.successRate}%`} />
        <Metric label="Avg confidence" value={`${(metrics.avgConfidence * 100).toFixed(0)}%`} />
        <Metric label="Fallbacks" value={String(metrics.fallbacks)} />
      </div>

      <h2 className="font-semibold mb-2 text-sm">System health</h2>
      <div className="glass rounded-xl p-3 mb-6 text-xs space-y-1">
        <Status ok label="Cloud Run API" />
        <Status ok label="Antigravity Orchestrator" />
        <Status ok label="Firestore (demo JSON)" />
        <Status warn label="Vertex AI" detail="Mock mode" />
        <Status ok label="Pub/Sub workflows" />
      </div>

      <h2 className="font-semibold mb-2 text-sm">Recent agent traces</h2>
      {traces.length === 0 ? (
        <p className="text-white/50 text-sm">Run orchestrations to populate traces.</p>
      ) : (
        traces.slice(-3).map((t, i) => (
          <div key={i} className="glass rounded-xl p-3 mb-3 text-xs">
            <p className="text-brand-300">{String(t.trace_id)}</p>
            <p className="text-white/50 truncate">{String(t.message)}</p>
            <p className="text-white/40">{String(t.status)}</p>
          </div>
        ))
      )}

      <h2 className="font-semibold mt-6 mb-2 text-sm">Live trace (session)</h2>
      <SessionTrace />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function Status({ ok, warn, label, detail }: { ok?: boolean; warn?: boolean; label: string; detail?: string }) {
  return (
    <div className="flex justify-between">
      <span className={ok ? "text-green-400" : warn ? "text-amber-400" : "text-red-400"}>
        ● {label}
      </span>
      {detail && <span className="text-white/40">{detail}</span>}
    </div>
  );
}

function SessionTrace() {
  const [data, setData] = useState<{ traces: Parameters<typeof AgentTrace>[0]["traces"] } | null>(null);
  useEffect(() => {
    const raw = sessionStorage.getItem("lastOrchestration");
    if (raw) setData(JSON.parse(raw));
  }, []);
  if (!data?.traces) return <p className="text-white/50 text-sm">No session trace</p>;
  return <AgentTrace traces={data.traces} />;
}
