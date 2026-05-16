// ─── Runtime Re-Assignment Agent ────────────────────────────────────────────
// When a provider cancels at runtime, this agent:
//   1. Picks the next best available provider from the pool
//   2. Updates the customer's booking with the new provider
//   3. Sends the customer a real-time notification
// ─────────────────────────────────────────────────────────────────────────────

export interface ProviderPool {
  id: string;
  name: string;
  domain: string;
  rating: number;
  distance_km: number;
  eta_minutes: number;
  hourly_rate: number;
  available: boolean;
}

// Simulated provider pool (in production this comes from backend)
const PROVIDER_POOL: ProviderPool[] = [
  { id: "P2", name: "Usman Electrics",     domain: "Electrician",    rating: 4.7, distance_km: 2.1, eta_minutes: 15, hourly_rate: 1200, available: true },
  { id: "P3", name: "Tariq AC Services",   domain: "AC Technician",  rating: 4.6, distance_km: 3.4, eta_minutes: 22, hourly_rate: 1800, available: true },
  { id: "P4", name: "Bilal Plumbing",      domain: "Plumber",        rating: 4.8, distance_km: 1.8, eta_minutes: 12, hourly_rate: 1100, available: true },
  { id: "P5", name: "Rizwan Home Fix",     domain: "Electrician",    rating: 4.5, distance_km: 2.9, eta_minutes: 18, hourly_rate: 1050, available: true },
  { id: "P6", name: "Hassan Tech Pro",     domain: "AC Technician",  rating: 4.9, distance_km: 4.2, eta_minutes: 28, hourly_rate: 2000, available: true },
  { id: "P7", name: "Shahid Plumber",      domain: "Plumber",        rating: 4.4, distance_km: 1.2, eta_minutes: 10, hourly_rate: 950,  available: true },
  { id: "P8", name: "Nadeem Cleaners",     domain: "Cleaning",       rating: 4.6, distance_km: 5.1, eta_minutes: 30, hourly_rate: 800,  available: true },
  { id: "P9", name: "Amjad Multi-Service", domain: "General",        rating: 4.3, distance_km: 2.6, eta_minutes: 20, hourly_rate: 1000, available: true },
];

export interface ReAssignmentResult {
  success: boolean;
  newProvider: ProviderPool | null;
  reason: string;
}

/**
 * Agent selects the next best available provider based on:
 *   - Highest rating (60% weight)
 *   - Shortest distance (40% weight)
 * Excludes the cancelled provider.
 */
export async function runReAssignmentAgent(
  cancelledProviderId: string,
  jobService: string,
  customerPhone: string,
  bookingId: string,
): Promise<ReAssignmentResult> {
  // Simulate network delay (agent thinking)
  await new Promise((r) => setTimeout(r, 2500));

  const candidates = PROVIDER_POOL.filter(
    (p) => p.id !== cancelledProviderId && p.available
  );

  if (candidates.length === 0) {
    return { success: false, newProvider: null, reason: "Koi aur ustaad available nahi" };
  }

  // Score: 60% rating + 40% proximity
  const scored = candidates.map((p) => ({
    ...p,
    score: (p.rating / 5) * 0.6 + (1 / (p.distance_km + 1)) * 0.4,
  }));

  scored.sort((a, b) => b.score - a.score);
  const newProvider = scored[0];

  // Update customer's booking in localStorage
  if (typeof window !== "undefined") {
    const { getUserBookings, saveBooking, addNotification } = await import("@/lib/auth");
    const bookings = getUserBookings(customerPhone);
    const booking = bookings.find((b) => b.id === bookingId || b.booking_id === bookingId);
    if (booking) {
      saveBooking(customerPhone, {
        ...booking,
        provider_name: newProvider.name,
        status: "confirmed",
      });
    }
    // Notify the customer
    addNotification(customerPhone, {
      title: "🔄 Naya Ustaad Assign Ho Gaya!",
      body: `Pehle wale ustaad ne cancel kiya. AI ne ${newProvider.name} ko select kiya — ETA ${newProvider.eta_minutes} min.`,
    });
  }

  return { success: true, newProvider, reason: "Agent ne next best match select kar liya" };
}
