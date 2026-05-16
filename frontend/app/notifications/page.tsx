"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff } from "lucide-react";
import {
  getUser,
  getUserNotifications,
  markAllNotificationsRead,
  type UserNotification,
} from "@/lib/auth";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Abhi abhi";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ghante`;
  return `${Math.floor(h / 24)} din`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push("/select-role"); return; }
    const notifs = getUserNotifications(user.phone);
    setNotifications(notifs);
    setLoaded(true);
    // Mark all as read when page opens
    markAllNotificationsRead(user.phone);
  }, [router]);

  if (!loaded) return null;

  return (
    <main className="flex min-h-screen flex-col px-4 pt-6 pb-28">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Alerts</h1>
          <p className="text-sm text-ink-muted">SMS aur app notifications</p>
        </div>
        {notifications.filter((n) => !n.read).length > 0 && (
          <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">
            {notifications.filter((n) => !n.read).length} naya
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card flex flex-col items-center py-14 text-center">
          <BellOff className="text-ink-faint mb-3" size={44} />
          <p className="font-semibold text-ink">Koi notification nahi</p>
          <p className="text-sm text-ink-muted mt-1">
            Booking confirm hone pe yahan dikhega
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card p-4 transition ${
                !n.read
                  ? "border-l-4 border-l-brand-500 bg-brand-50/30"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${!n.read ? "bg-brand-100 text-brand-600" : "bg-stone-100 text-ink-muted"}`}>
                    <Bell size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-ink text-sm">{n.title}</p>
                    <p className="text-sm text-ink-muted mt-0.5">{n.body}</p>
                  </div>
                </div>
                <span className="text-[11px] text-ink-faint shrink-0">
                  {timeAgo(n.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
