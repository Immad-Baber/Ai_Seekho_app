"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, CalendarDays, Bell, UserCircle, Plus, type LucideIcon } from "lucide-react";

const tabs = [
  { href: "/", icon: Home, label: "Home", labelUr: "Ghar" },
  { href: "/bookings", icon: CalendarDays, label: "Bookings", labelUr: "Bookings" },
  { href: "/notifications", icon: Bell, label: "Alerts", labelUr: "Alerts" },
  { href: "/provider", icon: UserCircle, label: "Ustaad", labelUr: "Ustaad" },
];

export function BottomNav() {
  const path = usePathname();
  const hideNav = path.startsWith("/voice");

  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-stone-200 shadow-nav safe-bottom">
      <div className="mx-auto max-w-lg flex items-end justify-around px-2 pt-2 pb-1">
        {tabs.slice(0, 2).map(({ href, icon: Icon, label, labelUr }) => {
          const active = path === href || (href !== "/" && path.startsWith(href));
          return (
            <NavItem key={href} href={href} active={active} icon={Icon} label={label} labelUr={labelUr} />
          );
        })}

        <Link
          href="/"
          className="relative -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/40 ring-4 ring-cream-50 transition hover:scale-105 active:scale-95"
          aria-label="Naya kaam book karein"
        >
          <Plus size={28} strokeWidth={2.5} />
        </Link>

        {tabs.slice(2).map(({ href, icon: Icon, label, labelUr }) => {
          const active = path === href || path.startsWith(href);
          return (
            <NavItem key={href} href={href} active={active} icon={Icon} label={label} labelUr={labelUr} />
          );
        })}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  active,
  icon: Icon,
  label,
  labelUr,
}: {
  href: string;
  active: boolean;
  icon: LucideIcon;
  label: string;
  labelUr: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex min-w-[64px] flex-col items-center gap-0.5 py-1 text-[10px] font-semibold transition",
        active ? "text-brand-700" : "text-ink-faint hover:text-ink-muted"
      )}
    >
      <span
        className={clsx(
          "flex h-9 w-9 items-center justify-center rounded-xl transition",
          active && "bg-brand-100 text-brand-700"
        )}
      >
        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      </span>
      <span>{labelUr}</span>
    </Link>
  );
}
