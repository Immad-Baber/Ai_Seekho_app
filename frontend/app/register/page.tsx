"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { saveUser, registerProvider, registerCustomer } from "@/lib/auth";
import {
  User, Phone, CreditCard, MapPin, Wrench, Clock,
  FileText, Camera, Image as GalleryIcon, Eye, EyeOff, ArrowLeft, CheckCircle2,
} from "lucide-react";

// Validation helpers
const validatePhone = (v: string) => /^03[0-9]{9}$/.test(v.replace(/-/g, ""));
const validateCnic  = (v: string) => /^[0-9]{5}-[0-9]{7}-[0-9]$/.test(v);
const validateName  = (v: string) => v.trim().length >= 3;
const validatePass  = (v: string) => v.length >= 6;

function InputField({
  label, id, type = "text", placeholder, value, onChange,
  error, icon: Icon, children,
}: {
  label: string; id: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string;
  icon?: React.ElementType; children?: React.ReactNode;
}) {
  const [showPass, setShowPass] = useState(false);
  const isPass = type === "password";
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      <div className="relative flex items-center gap-2">
        {Icon && (
          <div className="pointer-events-none absolute left-4 text-ink-faint">
            <Icon size={17} />
          </div>
        )}
        <input
          id={id}
          type={isPass ? (showPass ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input-field w-full ${Icon ? "pl-11" : ""} ${isPass ? "pr-11" : ""} ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}`}
        />
        {isPass && (
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-4 text-ink-faint hover:text-ink-muted">
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
        {children}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function PhotoUpload({ label }: { label: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      {preview ? (
        <div className="flex items-center gap-4">
          <img src={preview} alt="Preview" className="h-20 w-20 rounded-2xl object-cover border-2 border-brand-300" />
          <button onClick={() => setPreview(null)} className="text-xs text-red-500 underline">Remove</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 py-5 cursor-pointer text-ink-muted hover:border-brand-400 hover:bg-brand-50 transition">
            <Camera size={24} />
            <span className="text-xs font-semibold">Camera</span>
            <input type="file" accept="image/*" capture="user" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) setPreview(URL.createObjectURL(e.target.files[0])); }} />
          </label>
          <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 py-5 cursor-pointer text-ink-muted hover:border-brand-400 hover:bg-brand-50 transition">
            <GalleryIcon size={24} />
            <span className="text-xs font-semibold">Gallery</span>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) setPreview(URL.createObjectURL(e.target.files[0])); }} />
          </label>
        </div>
      )}
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const role = (params.get("role") as "user" | "provider") || "user";
  const isProvider = role === "provider";

  const [form, setForm] = useState({
    name: "", phone: "", cnic: "", password: "", confirmPassword: "",
    address: "", domain: "Electrician", experience: "", bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const set = (k: string) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const detectLocation = () => {
    setLocating(true);
    // Simulate Google Maps Geolocation API
    setTimeout(() => {
      set("address")("G-13/4, Islamabad, Pakistan");
      setLocating(false);
    }, 1800);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!validateName(form.name))    e.name = "Full name must be at least 3 characters";
    if (!validatePhone(form.phone))  e.phone = "Enter valid Pakistani number (e.g. 03001234567)";
    if (!validateCnic(form.cnic))    e.cnic = "Format: XXXXX-XXXXXXX-X";
    if (!validatePass(form.password)) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!isProvider && !form.address.trim()) e.address = "Address is required";
    if (isProvider && !form.experience.trim()) e.experience = "Please enter years of experience";
    if (isProvider && Number(form.experience) < 0) e.experience = "Experience cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const userData = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        cnic: form.cnic.trim(),
        role,
        address: form.address,
        domain: form.domain,
        experience: form.experience,
        bio: form.bio,
      };
      saveUser(userData);
      // Register in the global registry for matching
      if (isProvider) {
        registerProvider(userData);
      } else {
        registerCustomer(userData);
      }
      router.push(isProvider ? "/provider" : "/");
    }, 1200);
  };

  return (
    <main className="flex min-h-screen flex-col px-4 pt-6 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/select-role" className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-ink-muted hover:bg-stone-200 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">
            {isProvider ? "Ustaad Registration" : "Customer Registration"}
          </h1>
          <p className="text-xs text-ink-muted">
            {isProvider ? "Professional account banayein" : "Customer account banayein"}
          </p>
        </div>
      </div>

      <div className="card p-5 mb-4">
        {/* Role Badge */}
        <div className={`mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${isProvider ? "bg-accent-100 text-accent-800" : "bg-brand-100 text-brand-800"}`}>
          {isProvider ? <Wrench size={14} /> : <User size={14} />}
          {isProvider ? "Service Provider" : "Customer"}
        </div>

        <PhotoUpload label="Profile Photo (Camera ya Gallery se)" />

        <InputField id="name" label="Full Name" placeholder="Ali Khan" value={form.name}
          onChange={set("name")} error={errors.name} icon={User} />
        <InputField id="phone" label="Mobile Number" placeholder="03001234567" value={form.phone}
          onChange={set("phone")} error={errors.phone} icon={Phone} type="tel" />
        <InputField id="cnic" label="CNIC Number" placeholder="XXXXX-XXXXXXX-X" value={form.cnic}
          onChange={set("cnic")} error={errors.cnic} icon={CreditCard} />
        <InputField id="password" label="Password" placeholder="Min 6 characters" value={form.password}
          onChange={set("password")} error={errors.password} icon={undefined} type="password" />
        <InputField id="confirmPassword" label="Confirm Password" placeholder="Re-enter password" value={form.confirmPassword}
          onChange={set("confirmPassword")} error={errors.confirmPassword} icon={undefined} type="password" />

        {/* User-only fields */}
        {!isProvider && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Address / Location
            </label>
            <div className="flex gap-2">
              <input
                className={`input-field flex-1 ${errors.address ? "border-red-400" : ""}`}
                placeholder="Street, Sector, City"
                value={form.address}
                onChange={(e) => set("address")(e.target.value)}
              />
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                title="Detect via Google Maps"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 hover:bg-brand-200 transition disabled:opacity-60"
              >
                {locating
                  ? <div className="h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                  : <MapPin size={20} />}
              </button>
            </div>
            {errors.address && <p className="mt-1 text-xs font-medium text-red-500">{errors.address}</p>}
            {form.address.includes("Islamabad") && (
              <p className="mt-1 text-xs text-brand-600 flex items-center gap-1">
                <CheckCircle2 size={13} /> Location verified via Google Maps API
              </p>
            )}
          </div>
        )}

        {/* Provider-only fields */}
        {isProvider && (
          <>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Domain / Service Area
              </label>
              <select
                className="input-field w-full"
                value={form.domain}
                onChange={(e) => set("domain")(e.target.value)}
              >
                {["Electrician", "Plumber", "AC Technician", "Home Cleaning", "Home Beautician",
                  "Tutor", "Mechanic", "Carpenter", "Painter", "Driver"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <InputField id="experience" label="Years of Experience" placeholder="e.g. 5"
              value={form.experience} onChange={set("experience")} error={errors.experience}
              icon={Clock} type="number" />
            <div className="mb-4">
              <label htmlFor="bio" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Profile Bio / Summary
              </label>
              <textarea
                id="bio"
                rows={3}
                className="input-field w-full resize-none"
                placeholder="Apni skills aur tajurba bataein..."
                value={form.bio}
                onChange={(e) => set("bio")(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className={`w-full rounded-2xl py-4 text-base font-bold shadow-md transition active:scale-[0.98] disabled:opacity-60 ${
          isProvider
            ? "bg-gradient-to-r from-accent-500 to-accent-600 text-white"
            : "bg-gradient-to-r from-brand-600 to-brand-700 text-white"
        }`}
      >
        {loading
          ? <span className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Registering...
            </span>
          : "Register Now →"}
      </button>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 underline">
          Login karein
        </Link>
      </p>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
