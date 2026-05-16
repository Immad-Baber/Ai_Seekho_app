import { clsx } from "clsx";
import { Wrench } from "lucide-react";

export function BrandLogo({
  size = "md",
  showTagline = false,
}: {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}) {
  const sizes = {
    sm: { box: "w-9 h-9", icon: 18, title: "text-lg", tag: "text-[10px]" },
    md: { box: "w-11 h-11", icon: 22, title: "text-xl", tag: "text-xs" },
    lg: { box: "w-14 h-14", icon: 28, title: "text-2xl", tag: "text-sm" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className={clsx(
          s.box,
          "rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-lg shadow-brand-600/25 ring-2 ring-white"
        )}
      >
        <Wrench className="text-white" size={s.icon} strokeWidth={2.5} />
      </div>
      <div>
        <h1 className={clsx(s.title, "font-display font-bold tracking-tight")}>
          <span className="text-ink">Ustaad</span>{" "}
          <span className="text-brand-600">PK</span>
        </h1>
        {showTagline && (
          <p className={clsx(s.tag, "text-ink-muted font-medium")}>
            Sahi ustaad, seedha kaam
          </p>
        )}
      </div>
    </div>
  );
}
