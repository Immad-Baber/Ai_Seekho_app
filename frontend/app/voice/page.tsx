"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, MicOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { orchestrate } from "@/lib/api";

export default function VoicePage() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const router = useRouter();

  function startListening() {
    setError("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SR = win.webkitSpeechRecognition || win.SpeechRecognition;
    if (!SR) {
      setError("Speech recognition not supported. Use Chrome or type in chat.");
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
    rec.onresult = (e: { results: Iterable<{ 0: { transcript: string } }> }) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      setError("Could not capture audio — try again or use chat.");
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
      setError("API unavailable");
    }
  }

  return (
    <main className="p-4 flex flex-col min-h-[80vh]">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/60 mb-8">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-xl font-bold text-center mb-2">Voice Input</h1>
      <p className="text-center text-sm text-white/50 mb-8">Urdu / Roman Urdu · Google Speech-to-Text ready</p>

      <div className="flex-1 flex flex-col items-center justify-center">
        <button
          onClick={listening ? stopListening : startListening}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition ${
            listening
              ? "bg-red-500/30 border-2 border-red-400 animate-pulse"
              : "bg-brand-600/30 border-2 border-brand-400"
          }`}
        >
          {listening ? <MicOff size={48} /> : <Mic size={48} />}
        </button>
        <p className="mt-6 text-sm text-white/60">{listening ? "Listening…" : "Tap to speak"}</p>
      </div>

      {transcript && (
        <div className="glass rounded-xl p-4 mb-4">
          <p className="text-sm text-white/50 mb-1">Transcript</p>
          <p>{transcript}</p>
        </div>
      )}

      {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

      <button
        onClick={submitVoice}
        disabled={!transcript.trim()}
        className="w-full py-3 rounded-xl bg-brand-600 disabled:opacity-40 font-medium"
      >
        Process with AI
      </button>
    </main>
  );
}
