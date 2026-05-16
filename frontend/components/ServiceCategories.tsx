"use client";

import {
  Wind,
  Droplets,
  Zap,
  Sparkles,
  BookOpen,
  Car,
  SprayCan,
  WashingMachine,
  Hammer,
  Wrench,
} from "lucide-react";
import { clsx } from "clsx";

const SERVICES = [
  { id: "ac", label: "AC", labelUr: "AC", icon: Wind, color: "bg-sky-100 text-sky-700" },
  { id: "plumber", label: "Plumber", labelUr: "Plumber", icon: Droplets, color: "bg-blue-100 text-blue-700" },
  { id: "electrician", label: "Electric", labelUr: "Bijli", icon: Zap, color: "bg-amber-100 text-amber-700" },
  { id: "beautician", label: "Beauty", labelUr: "Beauty", icon: Sparkles, color: "bg-pink-100 text-pink-700" },
  { id: "tutor", label: "Tutor", labelUr: "Tutor", icon: BookOpen, color: "bg-violet-100 text-violet-700" },
  { id: "mechanic", label: "Mechanic", labelUr: "Gari", icon: Wrench, color: "bg-stone-200 text-stone-700" },
  { id: "cleaning", label: "Cleaning", labelUr: "Safai", icon: SprayCan, color: "bg-teal-100 text-teal-700" },
  { id: "appliance", label: "Machine", labelUr: "Machine", icon: WashingMachine, color: "bg-indigo-100 text-indigo-700" },
  { id: "home_repair", label: "Repair", labelUr: "Mistri", icon: Hammer, color: "bg-lime-100 text-lime-700" },
  { id: "driver", label: "Driver", labelUr: "Driver", icon: Car, color: "bg-cyan-100 text-cyan-700" },
];

const PROMPTS: Record<string, string> = {
  ac: "Mujhe kal subah AC service chahiye G-13 mein",
  plumber: "Geyser leak ho raha hai, plumber chahiye",
  electrician: "Electrician chahiye wiring aur fan ke liye",
  beautician: "Home beautician chahiye facial aur makeup ke liye",
  tutor: "Math tutor chahiye class 8 ke liye",
  mechanic: "Car mechanic chahiye engine check ke liye",
  cleaning: "Safai service chahiye ghar ki deep cleaning ke liye",
  appliance: "Washing machine pani leak kar rahi hai",
  home_repair: "Door lock aur furniture repair ke liye mistri chahiye",
  driver: "Kal subah airport drop ke liye driver chahiye",
};

export function ServiceCategories({
  onSelect,
  selected,
}: {
  onSelect: (prompt: string) => void;
  selected?: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {SERVICES.map(({ id, label, labelUr, icon: Icon, color }) => (
        <button
          key={id}
          type="button"
          onClick={() =>
            onSelect(PROMPTS[id] || `${label} service chahiye mere area mein`)
          }
          className={clsx(
            "flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition active:scale-95",
            selected === id ? "chip-active ring-2" : "card hover:shadow-card-hover"
          )}
        >
          <span className={clsx("flex h-10 w-10 items-center justify-center rounded-xl", color)}>
            <Icon size={20} strokeWidth={2} />
          </span>
          <span className="text-[11px] font-semibold text-ink leading-tight">{labelUr}</span>
        </button>
      ))}
    </div>
  );
}
