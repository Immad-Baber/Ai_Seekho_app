"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, History, Bell, LayoutDashboard, Briefcase } from "lucide-react";

const tabs = [
  { href: "/", icon: Home, label: "Chat" },
  { href: "/bookings", icon: History, label: "Bookings" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
  { href: "/provider", icon: Briefcase, label: "Provider" },
  { href: "/admin", icon: LayoutDashboard, label: "Admin" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 safe-bottom">
      <div className="mx-auto max-w-lg flex justify-around py-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== "/" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition",
                active ? "text-brand-400" : "text-white/50 hover:text-white/80"
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
