"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { saveUser, getAllProviders, getAllCustomers } from "@/lib/auth";
import { Phone, Eye, EyeOff, ArrowLeft, User, Wrench } from "lucide-react";

const validatePhone = (v: string) => /^03[0-9]{9}$/.test(v.replace(/-/g, ""));

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole]             = useState<"user" | "provider">("user");
  const [phone, setPhone]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [loading, setLoading]       = useState(false);
  const [notFound, setNotFound]     = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!validatePhone(phone)) e.phone = "Enter valid Pakistani number (e.g. 03001234567)";
    if (password.length < 6)  e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    setNotFound(false);
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const normalizedPhone = phone.replace(/-/g, "");

      // Search in the appropriate registry based on selected role
      if (role === "provider") {
        const providers = getAllProviders();
        const found = providers.find(
          (p) => p.phone.replace(/-/g, "") === normalizedPhone
        );
        if (found) {
          // Found in registry — restore session
          saveUser({ ...found, role: "provider" });
          router.push("/provider");
          return;
        }
      } else {
        const customers = getAllCustomers();
        const found = customers.find(
          (c) => c.phone.replace(/-/g, "") === normalizedPhone
        );
        if (found) {
          // Found in registry — restore session
          saveUser({ ...found, role: "user" });
          router.push("/");
          return;
        }
      }

      // Not found in registry
      setNotFound(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/select-role" className="mb-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition">
          <ArrowLeft size={16} /> Back to role selection
        </Link>

        <div className="flex justify-center mb-8">
          <BrandLogo size="md" showTagline />
        </div>

        <div className="card p-6">
          <h1 className="font-display text-2xl font-bold text-ink mb-1 text-center">
            Khush Amdeed 👋
          </h1>
          <p className="text-center text-sm text-ink-muted mb-6">Login karein aur shuru karein</p>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-stone-100 rounded-2xl">
            {([["user", "Customer", User], ["provider", "Ustaad / Pro", Wrench]] as const).map(([r, label, Icon]) => (
              <button
                key={r}
                onClick={() => { setRole(r); setNotFound(false); setErrors({}); }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                  role === r ? "bg-white shadow text-brand-700" : "text-ink-muted hover:text-ink"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Mobile Number
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-3.5 text-ink-faint"><Phone size={17} /></div>
              <input
                type="tel"
                className={`input-field w-full pl-11 ${errors.phone ? "border-red-400" : ""}`}
                placeholder="03001234567"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setNotFound(false); }}
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Password</label>
              <span className="text-xs text-brand-600 cursor-pointer hover:underline">Forgot?</span>
            </div>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className={`input-field w-full pr-11 ${errors.password ? "border-red-400" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setNotFound(false); }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-3.5 text-ink-faint hover:text-ink-muted">
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {notFound && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              ❌ Account nahi mila. Phone number ya role galat hai. Pehle{" "}
              <Link href={`/register?role=${role}`} className="font-bold underline">register karein</Link>.
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary w-full py-3.5 text-base"
          >
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Logging in...
                </span>
              : "Login →"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Naya account?{" "}
          <Link href={`/register?role=${role}`} className="font-semibold text-brand-600 underline">
            Register karein
          </Link>
        </p>
      </div>
    </main>
  );
}
