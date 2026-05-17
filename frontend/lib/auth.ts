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

// ── Provider Jobs ───────────────────────────────────────────────────────────

export interface ProviderJob {
  id: string;
  service: string;
  area: string;
  time: string;
  pay: number;
  status: "auto-assigned" | "in-progress" | "completed" | "cancelled" | "re-assigning";
  customer: string;
  customerPhone: string;
  bookingId: string;
  assignedAt: string;
  cancelReason?: string;
  reAssignedTo?: unknown;
  domain: string; // service domain this job belongs to
}

export function getProviderJobs(phone: string): ProviderJob[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(userKey(phone, "provider_jobs"));
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveProviderJob(phone: string, job: ProviderJob) {
  const existing = getProviderJobs(phone);
  const idx = existing.findIndex((j) => j.id === job.id);
  if (idx >= 0) {
    existing[idx] = job;
  } else {
    existing.unshift(job);
  }
  localStorage.setItem(userKey(phone, "provider_jobs"), JSON.stringify(existing));
}

export function updateProviderJob(phone: string, jobId: string, updates: Partial<ProviderJob>) {
  const jobs = getProviderJobs(phone);
  const updated = jobs.map((j) => j.id === jobId ? { ...j, ...updates } : j);
  localStorage.setItem(userKey(phone, "provider_jobs"), JSON.stringify(updated));
}

// ── Provider Reviews / Reputation ───────────────────────────────────────────

export interface ProviderReview {
  id: string;
  customerName: string;
  service: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export function getProviderReviews(phone: string): ProviderReview[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(userKey(phone, "provider_reviews"));
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveProviderReview(phone: string, review: ProviderReview) {
  const existing = getProviderReviews(phone);
  existing.unshift(review);
  localStorage.setItem(userKey(phone, "provider_reviews"), JSON.stringify(existing));
}

export function getProviderStats(phone: string) {
  const jobs = getProviderJobs(phone);
  const reviews = getProviderReviews(phone);
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const cancelledJobs = jobs.filter((j) => j.status === "cancelled");
  const totalJobs = jobs.length;
  const todayJobs = jobs.filter((j) => {
    const d = new Date(j.assignedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const completionRate = totalJobs > 0
    ? Math.round((completedJobs.length / totalJobs) * 100)
    : 0;

  const onTimeRate = completedJobs.length > 0 ? completionRate : 0;

  return {
    totalJobs,
    completedJobs: completedJobs.length,
    cancelledJobs: cancelledJobs.length,
    todayJobs: todayJobs.length,
    totalReviews: reviews.length,
    avgRating: avgRating > 0 ? avgRating.toFixed(1) : "0.0",
    onTimeRate: `${onTimeRate}%`,
    completionRate: `${completionRate}%`,
  };
}

// ── Provider Availability ───────────────────────────────────────────────────

export interface ProviderAvailabilityData {
  online: boolean;
  maxJobs: number;
  breakMode: boolean;
  schedule: Record<string, { id: string; start: string; end: string }[]>;
  areas: { area: string; active: boolean }[];
}

export function getProviderAvailability(phone: string): ProviderAvailabilityData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(userKey(phone, "provider_availability"));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveProviderAvailability(phone: string, data: ProviderAvailabilityData) {
  localStorage.setItem(userKey(phone, "provider_availability"), JSON.stringify(data));
}

// ── All registered providers (for matching) ─────────────────────────────────

export function getAllProviders(): AuthUser[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("all_providers");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function registerProvider(user: AuthUser) {
  const providers = getAllProviders();
  const idx = providers.findIndex((p) => p.phone === user.phone);
  if (idx >= 0) {
    providers[idx] = user;
  } else {
    providers.push(user);
  }
  localStorage.setItem("all_providers", JSON.stringify(providers));
}

// ── All registered customers (for matching) ─────────────────────────────────

export function getAllCustomers(): AuthUser[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("all_customers");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function registerCustomer(user: AuthUser) {
  const customers = getAllCustomers();
  const idx = customers.findIndex((c) => c.phone === user.phone);
  if (idx >= 0) {
    customers[idx] = user;
  } else {
    customers.push(user);
  }
  localStorage.setItem("all_customers", JSON.stringify(customers));
}
