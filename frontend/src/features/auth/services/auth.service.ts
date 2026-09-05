import { api } from "@/lib/api";
import type { LoginFormValues } from "../validators/auth.validator";

// The staff user shape GET /auth/me returns (see backend
// src/services/auth.service.ts's getCurrentUser - never includes the
// password hash).
export interface AuthUser {
  id: string;
  name: string;
  loginId: string;
  email: string;
  role: "ADMIN" | "ACCOUNTANT";
}

// Calls POST /auth/login (plan.md Module 3). api.ts already unwraps the
// { success, data } envelope, so this just returns the data straight.
export function login(values: LoginFormValues) {
  return api.post("/auth/login", values);
}

// Calls GET /auth/me to read the current session. Used by useAuth() to
// know who's logged in (and whether anyone is logged in at all).
export function me(): Promise<{ user: AuthUser }> {
  return api.get("/auth/me");
}
