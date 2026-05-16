"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";

export default function PricingPage() {
  const data = useOrchestration();
  const p = data?.pricing;
  return (
    <main className="p-4">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Pricing Breakdown</h1>
      {!p ? (
        <p className="text-ink-muted text-sm">No pricing data.</p>
      ) : (
        <>
          <div className="glass rounded-2xl p-4 space-y-2">
            {p.line_items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-2 border-b border-white/5">
                <div>
                  <p>{item.label}</p>
                  {item.description && <p className="text-xs text-ink-faint">{item.description}</p>}
                  {item.multiplier && (
                    <p className="text-xs text-brand-700">×{item.multiplier}</p>
                  )}
                </div>
                <span className={item.amount < 0 ? "text-green-600" : ""}>
                  {item.amount < 0 ? "" : "+"}PKR {Math.abs(item.amount).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-3 font-bold text-lg">
              <span>Total</span>
              <span className="gradient-text">PKR {p.total.toLocaleString()}</span>
            </div>
            {p.surge_applied && <p className="text-xs text-amber-500">Peak demand surge applied</p>}
          </div>
        </>
      )}
    </main>
  );
}
