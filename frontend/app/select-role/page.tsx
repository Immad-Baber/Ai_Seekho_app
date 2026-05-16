"use client";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { User, Wrench, ArrowRight } from "lucide-react";

export default function SelectRolePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <BrandLogo size="lg" showTagline />
        </div>

        <h1 className="text-center font-display text-2xl font-bold text-ink mb-2">
          Aap kaun hain?
        </h1>
        <p className="text-center text-sm text-ink-muted mb-8">
          Apna role chunein — aage badh ke register ya login karein
        </p>

        {/* Role Cards */}
        <div className="space-y-4">
          <Link
            href="/register?role=user"
            className="group flex items-center gap-5 rounded-3xl border-2 border-stone-200 bg-white p-5 shadow-card transition hover:border-brand-400 hover:shadow-card-hover active:scale-[0.99]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
              <User size={28} />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-ink">Customer</p>
              <p className="text-sm text-ink-muted">Service dhundhein aur ustaad hire karein</p>
            </div>
            <ArrowRight size={20} className="text-ink-faint transition group-hover:text-brand-600" />
          </Link>

          <Link
            href="/register?role=provider"
            className="group flex items-center gap-5 rounded-3xl border-2 border-stone-200 bg-white p-5 shadow-card transition hover:border-accent-400 hover:shadow-card-hover active:scale-[0.99]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700 transition group-hover:bg-accent-500 group-hover:text-white">
              <Wrench size={28} />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-ink">Ustaad / Professional</p>
              <p className="text-sm text-ink-muted">Kaam karein aur kamai barhaein</p>
            </div>
            <ArrowRight size={20} className="text-ink-faint transition group-hover:text-accent-600" />
          </Link>
        </div>

        {/* Already have account */}
        <p className="mt-10 text-center text-sm text-ink-muted">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-brand-600 underline">
            Login karein
          </Link>
        </p>
      </div>
    </main>
  );
}
