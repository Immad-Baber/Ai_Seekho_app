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
