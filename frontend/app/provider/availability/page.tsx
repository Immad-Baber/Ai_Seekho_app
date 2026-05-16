"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function ProviderAvailability() {
  const [on, setOn] = useState(true);
  return (
    <main className="p-4">
      <Link href="/provider" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Availability</h1>
      <button
        onClick={() => setOn(!on)}
        className={`w-full py-4 rounded-2xl font-medium ${on ? "bg-green-600/30 border border-green-500" : "glass"}`}
      >
        {on ? "Available now ✓" : "Unavailable"}
      </button>
      <p className="text-sm text-ink-muted mt-4">Max daily jobs: 6 · Current: 2</p>
    </main>
  );
}
