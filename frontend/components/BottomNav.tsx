"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Home, CalendarDays, Bell, UserCircle, Plus,
  Briefcase, DollarSign, type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getUser, type AuthUser } from "@/lib/auth";

// Auth pages that should NOT show the nav
const AUTH_PAGES = ["/select-role", "/login", "/register"];

// Tabs for regular users
const USER_TABS = [
  { href: "/",          icon: Home,        labelUr: "Ghar" },
  { href: "/bookings",  icon: CalendarDays, labelUr: "Bookings" },
  { href: "/notifications", icon: Bell,    labelUr: "Alerts" },
  { href: "/profile",   icon: UserCircle,  labelUr: "Profile" },
];

// Tabs for service providers
const PROVIDER_TABS = [
  { href: "/provider",         icon: Home,        labelUr: "Dashboard" },
  { href: "/provider/jobs",    icon: Briefcase,   labelUr: "Jobs" },
  { href: "/provider/earnings", icon: DollarSign, labelUr: "Kamai" },
  { href: "/provider-profile", icon: UserCircle,  labelUr: "Profile" },
];

function isTabActive(tabHref: string, currentPath: string): boolean {
  if (tabHref === "/") {
    return currentPath === "/";
  }
  if (tabHref === "/provider") {
    // Only match exactly /provider, NOT /provider/jobs etc
    return currentPath === "/provider";
  }
  return currentPath === tabHref || currentPath.startsWith(tabHref + "/") || currentPath.startsWith(tabHref + "?");
}

export function BottomNav() {
  const path = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, [path]); // re-check on every navigation

  // Hide on auth pages
  const hideNav = AUTH_PAGES.some((p) => path === p || path.startsWith(p + "?"));
  if (hideNav) return null;

  const isProvider = user?.role === "provider";
  const tabs = isProvider ? PROVIDER_TABS : USER_TABS;
  const fabHref = isProvider ? "/provider/jobs" : "/";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-stone-200 shadow-nav safe-bottom">
      <div className="mx-auto max-w-lg flex items-end justify-around px-2 pt-2 pb-1">
        {tabs.slice(0, 2).map(({ href, icon: Icon, labelUr }) => {
          const active = isTabActive(href, path);
          return <NavItem key={href} href={href} active={active} icon={Icon} label={labelUr} isProvider={isProvider} />;
        })}

        {/* Center FAB */}
        <Link
          href={fabHref}
          className={clsx(
            "relative -top-4 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-cream-50 transition hover:scale-105 active:scale-95",
            isProvider
              ? "bg-gradient-to-br from-accent-500 to-accent-700 shadow-accent-600/40"
              : "bg-gradient-to-br from-brand-500 to-brand-700 shadow-brand-600/40"
          )}
          aria-label={isProvider ? "View new jobs" : "Book a service"}
        >
          <Plus size={28} strokeWidth={2.5} />
        </Link>

        {tabs.slice(2).map(({ href, icon: Icon, labelUr }) => {
          const active = isTabActive(href, path);
          return <NavItem key={href} href={href} active={active} icon={Icon} label={labelUr} isProvider={isProvider} />;
        })}
      </div>
    </nav>
  );
}

function NavItem({
  href, active, icon: Icon, label, isProvider,
}: {
  href: string; active: boolean; icon: LucideIcon; label: string; isProvider: boolean;
}) {
  const activeColor = isProvider ? "text-accent-700" : "text-brand-700";
  const activeBg    = isProvider ? "bg-accent-100 text-accent-700" : "bg-brand-100 text-brand-700";

  return (
    <Link
      href={href}
      className={clsx(
        "flex min-w-[64px] flex-col items-center gap-0.5 py-1 text-[10px] font-semibold transition",
        active ? activeColor : "text-ink-faint hover:text-ink-muted"
      )}
    >
      <span className={clsx("flex h-9 w-9 items-center justify-center rounded-xl transition", active && activeBg)}>
        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      </span>
      <span>{label}</span>
    </Link>
  );
}
