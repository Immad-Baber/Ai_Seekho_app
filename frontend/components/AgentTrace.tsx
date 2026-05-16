"use client";

import type { OrchestrationResult } from "@/lib/api";

export function AgentTrace({ traces }: { traces: OrchestrationResult["traces"] }) {
  return (
    <div className="space-y-3">
      {traces.map((t, i) => (
        <div key={i} className="glass rounded-xl p-3 border-l-2 border-brand-500">
          <div className="flex justify-between items-start gap-2">
            <span className="text-xs font-semibold text-brand-300">[{t.agent}]</span>
            {t.confidence != null && (
              <span className="text-xs text-white/50">{Math.round(t.confidence * 100)}%</span>
            )}
          </div>
          <p className="text-sm text-white/90 mt-1">{t.message}</p>
        </div>
      ))}
    </div>
  );
}
