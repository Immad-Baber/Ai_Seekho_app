"use client";

import type { OrchestrationResult } from "@/lib/api";

export function AgentTrace({ traces }: { traces: OrchestrationResult["traces"] }) {
  return (
    <div className="space-y-3">
      {traces.map((t, i) => (
        <div
          key={i}
          className="card border-l-4 border-l-brand-500 p-3 animate-fade-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex justify-between items-start gap-2">
            <span className="text-xs font-bold text-brand-700">{t.agent}</span>
            {t.confidence != null && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-800">
                {Math.round(t.confidence * 100)}%
              </span>
            )}
          </div>
          <p className="text-sm text-ink mt-1.5 leading-relaxed">{t.message}</p>
        </div>
      ))}
    </div>
  );
}
