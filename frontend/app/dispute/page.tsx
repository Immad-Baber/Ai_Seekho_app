"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createDispute } from "@/lib/api";
import { useOrchestration } from "@/hooks/useOrchestration";

const TYPES = [
  { id: "price_dispute", label: "Price dispute" },
  { id: "no_show", label: "Provider no-show" },
  { id: "quality", label: "Quality complaint" },
];

export default function DisputePage() {
  const data = useOrchestration();
  const [type, setType] = useState("price_dispute");
  const [desc, setDesc] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function submit() {
    const id = data?.booking_id || "BK-DEMO001";
    const res = await createDispute(id, type, desc || "User complaint");
    setResult(res);
  }

  return (
    <main className="p-4">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Complaint / Dispute</h1>
      <div className="space-y-2 mb-4">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`w-full text-left p-3 rounded-xl glass ${type === t.id ? "border border-brand-500" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Describe the issue..."
        className="w-full glass rounded-xl p-3 h-24 text-sm mb-4"
      />
      <button onClick={submit} className="w-full py-3 rounded-xl bg-brand-600 font-medium">
        Submit to Dispute Agent
      </button>
      {result && (
        <div className="mt-4 glass rounded-xl p-4 text-sm space-y-2">
          <p>Resolution: {(result as { resolution: string }).resolution}</p>
          <p>Compensation: PKR {(result as { compensation: number }).compensation}</p>
          {(result as { escalated: boolean }).escalated && (
            <p className="text-amber-500">Escalated to admin</p>
          )}
        </div>
      )}
    </main>
  );
}
