"use client";

const NOTIFICATIONS = [
  { id: 1, title: "Booking confirmed", body: "Hassan AC Experts · Tomorrow 10:00 AM", time: "2m ago", read: false },
  { id: 2, title: "Reminder", body: "Service in 1 hour — G-13", time: "1h ago", read: true },
  { id: 3, title: "Provider en route", body: "ETA 18 minutes", time: "3h ago", read: true },
  { id: 4, title: "Price estimate ready", body: "PKR 4,850 total", time: "Yesterday", read: true },
];

export default function NotificationsPage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Notifications</h1>
      <p className="text-xs text-white/40 mb-4">FCM + WhatsApp (simulated)</p>
      <div className="space-y-2">
        {NOTIFICATIONS.map((n) => (
          <div
            key={n.id}
            className={`glass rounded-xl p-4 ${!n.read ? "border-l-2 border-brand-500" : ""}`}
          >
            <div className="flex justify-between">
              <p className="font-medium text-sm">{n.title}</p>
              <span className="text-xs text-white/40">{n.time}</span>
            </div>
            <p className="text-sm text-white/60 mt-1">{n.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
