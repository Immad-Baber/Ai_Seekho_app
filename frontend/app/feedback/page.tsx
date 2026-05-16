"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, CheckCircle2 } from "lucide-react";
import { useOrchestration } from "@/hooks/useOrchestration";
import { getUser, saveFeedback } from "@/lib/auth";

export default function FeedbackPage() {
  const data = useOrchestration();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!rating) return;
    setLoading(true);

    const user = getUser();
    if (user) {
      saveFeedback(user.phone, {
        id: `fb_${Date.now()}`,
        booking_id: data?.booking_id || `BK-${Date.now()}`,
        provider_name: data?.selected_provider?.name || "Service Provider",
        rating,
        comment: comment.trim(),
        created_at: new Date().toISOString(),
      });
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="mb-4 text-green-500" size={56} strokeWidth={1.5} />
        <h1 className="font-display text-2xl font-bold text-ink mb-2">Shukriya! 🎉</h1>
        <p className="text-sm text-ink-muted mb-2">
          Aapki rating save ho gayi. Reputation agent ne provider score update kar diya.
        </p>
        <div className="flex gap-1 justify-center mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={28}
              className={i < rating ? "text-amber-500 fill-amber-400" : "text-stone-200 fill-stone-200"}
            />
          ))}
        </div>
        <Link href="/bookings" className="btn-primary px-8">
          Meri Bookings →
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-muted mb-6">
        <ArrowLeft size={16} /> Back
      </Link>

      <h1 className="font-display text-xl font-bold text-ink mb-1">Feedback & Rating</h1>
      <p className="text-sm text-ink-muted mb-6">
        {data?.selected_provider
          ? `${data.selected_provider.name} ko rate karein`
          : "Apni service experience rate karein"}
      </p>

      {/* Provider info */}
      {data?.selected_provider && (
        <div className="card mb-5 p-4">
          <p className="text-xs font-semibold text-ink-muted mb-1">Service Provider</p>
          <p className="font-bold text-ink">{data.selected_provider.name}</p>
          <p className="text-sm text-ink-muted capitalize mt-0.5">{data.intent?.service_type}</p>
        </div>
      )}

      {/* Star Rating */}
      <div className="card mb-4 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-4">
          Kitne stars dena chahte hain?
        </p>
        <div className="flex gap-3 justify-center mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className="transition hover:scale-110 active:scale-95"
            >
              <Star
                size={40}
                className={
                  n <= rating
                    ? "text-amber-500 fill-amber-400"
                    : "text-stone-200 fill-stone-200 hover:text-amber-300"
                }
              />
            </button>
          ))}
        </div>
        <p className="text-sm font-semibold text-ink-muted">
          {rating === 0 && "Tap karein rating dene ke liye"}
          {rating === 1 && "😞 Bahut bura"}
          {rating === 2 && "😐 Theek nahi tha"}
          {rating === 3 && "🙂 Theek tha"}
          {rating === 4 && "😊 Acha tha!"}
          {rating === 5 && "🤩 Zabardast!"}
        </p>
      </div>

      {/* Comment */}
      <div className="card mb-5 p-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Comments (Optional)
        </label>
        <textarea
          placeholder="Koi khaas baat batana chahein to..."
          className="input-field w-full resize-none"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!rating || loading}
        className="btn-primary w-full py-4 text-base disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Saving...
          </span>
        ) : (
          "Submit Feedback ★"
        )}
      </button>
    </main>
  );
}
