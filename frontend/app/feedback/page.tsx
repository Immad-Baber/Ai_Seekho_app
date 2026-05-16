"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="p-4">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold mb-4">Feedback & Rating</h1>
      {submitted ? (
        <p className="text-green-600">Thank you! Reputation agent updated provider score.</p>
      ) : (
        <>
          <p className="text-sm text-ink-muted mb-4">Rate your service experience</p>
          <div className="flex gap-2 justify-center mb-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)}>
                <Star
                  size={36}
                  className={n <= rating ? "text-amber-500 fill-amber-400" : "text-stone-300"}
                />
              </button>
            ))}
          </div>
          <textarea
            placeholder="Comments (optional)..."
            className="w-full glass rounded-xl p-3 h-24 text-sm mb-4 border border-white/10"
          />
          <button
            onClick={() => setSubmitted(true)}
            disabled={!rating}
            className="w-full py-3 rounded-xl bg-brand-600 disabled:opacity-40"
          >
            Submit feedback
          </button>
        </>
      )}
    </main>
  );
}
