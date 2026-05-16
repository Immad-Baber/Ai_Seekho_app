"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Mic, MicOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { orchestrate } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";

export default function VoicePage() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const router = useRouter();

  function startListening() {
    setError("");
    const win = window as any;
    const SR = win.webkitSpeechRecognition || win.SpeechRecognition;
    if (!SR) {
      setError("Voice is browser mein supported nahi. Chrome try karein ya type karein.");
      return;
    }
    const rec = new SR() as {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      start: () => void;
      stop: () => void;
      onresult: ((e: { results: Iterable<{ 0: { transcript: string } }> }) => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
    };
    rec.lang = "ur-PK";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      setError("Sun nahi paye — dubara try karein.");
    };
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function submitVoice() {
    if (!transcript.trim()) return;
    try {
      const res = await orchestrate(transcript);
      sessionStorage.setItem("lastOrchestration", JSON.stringify(res));
      router.push("/summary");
    } catch {
      setError("Server connect nahi ho raha.");
    }
  }

  return (
    <main className="flex min-h-[85vh] flex-col p-4">
      <PageHeader title="Bol kar batao" subtitle="Urdu ya Roman Urdu mein" />

      <div className="flex flex-1 flex-col items-center justify-center py-8">
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          className={`flex h-36 w-36 items-center justify-center rounded-full transition ${
            listening
              ? "bg-red-100 text-red-600 ring-4 ring-red-200 animate-pulse"
              : "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl shadow-brand-600/30"
          }`}
        >
          {listening ? <MicOff size={52} /> : <Mic size={52} />}
        </button>
        <p className="mt-6 text-center text-sm font-medium text-ink-muted">
          {listening ? "Sun rahe hain..." : "Mic dabayein aur boliye"}
        </p>
      </div>

      {transcript && (
        <div className="card mb-4 p-4">
          <p className="text-xs font-semibold text-ink-muted mb-1">Aap ne kaha:</p>
          <p className="text-ink">{transcript}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <button
        type="button"
        onClick={submitVoice}
        disabled={!transcript.trim()}
        className="btn-primary w-full"
      >
        Ustaad dhundo
      </button>
    </main>
  );
}
