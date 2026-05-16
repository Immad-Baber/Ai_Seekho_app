"use client";

const NOTIFICATIONS = [
  { id: 1, title: "Booking confirm!", body: "Hassan AC Experts · Kal 10:00 baje", time: "2 min", read: false },
  { id: 2, title: "Yaad dilana", body: "1 ghante mein service — G-13", time: "1 hr", read: true },
  { id: 3, title: "Ustaad raaste mein", body: "ETA 18 minute", time: "3 hr", read: true },
  { id: 4, title: "Qeemat tayyar", body: "Total PKR 4,850", time: "Kal", read: true },
];

export default function NotificationsPage() {
  return (
    <main className="p-4">
      <h1 className="page-title mb-1">Alerts</h1>
      <p className="text-sm text-ink-muted mb-5">SMS aur app notifications</p>
      <div className="space-y-2">
        {NOTIFICATIONS.map((n) => (
          <div
            key={n.id}
            className={`card p-4 ${!n.read ? "border-l-4 border-l-brand-500 bg-brand-50/30" : ""}`}
          >
            <div className="flex justify-between">
              <p className="font-semibold text-ink text-sm">{n.title}</p>
              <span className="text-xs text-ink-faint">{n.time}</span>
            </div>
            <p className="text-sm text-ink-muted mt-1">{n.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
