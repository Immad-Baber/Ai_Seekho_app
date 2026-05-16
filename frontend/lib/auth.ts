// ─── Auth Helper ───────────────────────────────────────────────────────────

export type UserRole = "user" | "provider";

export interface AuthUser {
  name: string;
  phone: string;
  cnic: string;
  role: UserRole;
  // User-only fields
  address?: string;
  // Provider-only fields
  domain?: string;
  experience?: string;
  bio?: string;
}

export interface UserBooking {
  id: string;
  provider_name: string;
  service_type: string;
  status: "confirmed" | "in-progress" | "completed" | "cancelled";
  total_price: number;
  created_at: string;
  schedule_start?: string;
  booking_id?: string;
}

export interface UserFeedback {
  id: string;
  booking_id: string;
  provider_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("authUser");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveUser(user: AuthUser) {
  localStorage.setItem("authUser", JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem("authUser");
}

export function isLoggedIn(): boolean {
  return !!getUser();
}

// ─── Per-user data helpers (keyed by phone number) ─────────────────────────

function userKey(phone: string, type: string) {
  return `${type}_${phone.replace(/-/g, "")}`;
}

// ── Bookings ────────────────────────────────────────────────────────────────

export function getUserBookings(phone: string): UserBooking[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(userKey(phone, "bookings"));
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveBooking(phone: string, booking: UserBooking) {
  const existing = getUserBookings(phone);
  // Replace if same ID, otherwise prepend
  const idx = existing.findIndex((b) => b.id === booking.id);
  if (idx >= 0) {
    existing[idx] = booking;
  } else {
    existing.unshift(booking);
  }
  localStorage.setItem(userKey(phone, "bookings"), JSON.stringify(existing));
}

export function updateBookingStatus(
  phone: string,
  bookingId: string,
  status: UserBooking["status"]
) {
  const bookings = getUserBookings(phone);
  const updated = bookings.map((b) =>
    b.id === bookingId ? { ...b, status } : b
  );
  localStorage.setItem(userKey(phone, "bookings"), JSON.stringify(updated));
}

// ── Feedback ────────────────────────────────────────────────────────────────

export function getUserFeedback(phone: string): UserFeedback[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(userKey(phone, "feedback"));
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveFeedback(phone: string, feedback: UserFeedback) {
  const existing = getUserFeedback(phone);
  existing.unshift(feedback);
  localStorage.setItem(userKey(phone, "feedback"), JSON.stringify(existing));
}

// ── Notifications ───────────────────────────────────────────────────────────

export interface UserNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export function getUserNotifications(phone: string): UserNotification[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(userKey(phone, "notifications"));
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function addNotification(phone: string, notif: Omit<UserNotification, "id" | "read" | "created_at">) {
  const existing = getUserNotifications(phone);
  const newNotif: UserNotification = {
    ...notif,
    id: `notif_${Date.now()}`,
    read: false,
    created_at: new Date().toISOString(),
  };
  existing.unshift(newNotif);
  localStorage.setItem(userKey(phone, "notifications"), JSON.stringify(existing));
  return newNotif;
}

export function markAllNotificationsRead(phone: string) {
  const existing = getUserNotifications(phone);
  const updated = existing.map((n) => ({ ...n, read: true }));
  localStorage.setItem(userKey(phone, "notifications"), JSON.stringify(updated));
}
