const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type OrchestrationResult = {
  trace_id: string;
  intent: {
    raw_message: string;
    detected_language: string;
    service_type?: string;
    urgency: string;
    location_text?: string;
    time_preference?: string;
    confidence: number;
    needs_clarification: boolean;
    clarification_questions: string[];
    complexity: string;
  };
  matches: Array<{
    provider_id: string;
    name: string;
    total_score: number;
    selected: boolean;
    rejection_reasons: string[];
    distance_km?: number;
    eta_minutes?: number;
    hourly_rate: number;
    specialization: string[];
    factor_scores: Array<{ factor: string; score: number; weighted: number; note?: string }>;
  }>;
  selected_provider?: { provider_id: string; name: string; total_score: number };
  pricing?: {
    total: number;
    subtotal: number;
    line_items: Array<{ label: string; amount: number; description?: string; multiplier?: number }>;
    surge_applied: boolean;
    currency: string;
  };
  schedule?: {
    start: string;
    end: string;
    conflict_detected: boolean;
    buffer_minutes: number;
    alternate_slots: Array<{ start: string; end: string }>;
  };
  booking_id?: string;
  status: string;
  traces: Array<{ agent: string; action: string; message: string; confidence?: number; timestamp: string }>;
  workflow_chain: string[];
  fallback_used: boolean;
  edge_case?: string;
};

export async function orchestrate(message: string, userId = "demo-user-1"): Promise<OrchestrationResult> {
  const res = await fetch(`${API}/api/v1/orchestrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, user_id: userId }),
  });
  if (!res.ok) throw new Error("Orchestration failed");
  return res.json();
}

export async function runDemo(scenario: string): Promise<OrchestrationResult> {
  const res = await fetch(`${API}/api/v1/demo/${scenario}`, { method: "POST" });
  if (!res.ok) throw new Error("Demo failed");
  const data = await res.json();
  return data.orchestration ?? data;
}

export async function getBookings(userId?: string) {
  const q = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API}/api/v1/bookings${q}`);
  return res.json();
}

export async function getTraces(limit = 30) {
  const res = await fetch(`${API}/api/v1/traces?limit=${limit}`);
  return res.json();
}

export async function getProviders() {
  const res = await fetch(`${API}/api/v1/providers`);
  return res.json();
}

export async function createDispute(bookingId: string, type: string, description: string) {
  const res = await fetch(`${API}/api/v1/disputes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ booking_id: bookingId, type, description, user_id: "demo-user-1" }),
  });
  return res.json();
}

export async function getMapsKey(): Promise<string> {
  try {
    const res = await fetch(`${API}/api/v1/config/maps-key`);
    if (!res.ok) return "";
    const data = await res.json();
    return data.google_maps_api_key || "";
  } catch {
    return "";
  }
}
