import { api } from "@/lib/api";
import type { ContactLoginFormValues, LoginFormValues } from "../validators/auth.validator";

// The Contact shape POST /auth/contact-login returns (see backend
// src/services/auth.service.ts's SafeContact - never includes the
// password hash).
export interface AuthContact {
  id: string;
  name: string;
  email: string;
  type: string;
  role: "CONTACT";
}

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
export function me(): Promise<{ user: AuthUser | AuthContact }> {
  return api.get("/auth/me");
}

// Calls POST /auth/logout, which clears the accessToken/refreshToken
// cookies on the backend.
export function logout() {
  return api.post("/auth/logout");
}

// Calls POST /auth/forgot-password. The backend always replies 200
// whether or not the email has an account (so an attacker can't use
// this to check which emails exist) - so this never really "fails"
// except on a genuine network/server error.
export function forgotPassword(email: string) {
  return api.post("/auth/forgot-password", { email });
}

// Calls POST /auth/reset-password with the token from the email link
// plus the new password. Rejects with a friendly error (via api.ts's
// interceptor) if the token is invalid or expired.
export function resetPassword(token: string, newPassword: string) {
  return api.post("/auth/reset-password", { token, newPassword });
}

// Calls POST /auth/contact-login (plan.md Module 6).
export function contactLogin(values: ContactLoginFormValues): Promise<{ contact: AuthContact }> {
  return api.post("/auth/contact-login", values);
}

// Calls POST /auth/activate-account with the token from the invitation
// email plus the password the Contact is setting for the first time.
// Reuses the same endpoint/shape as resetPassword - see
// backend/src/services/auth.service.ts's activateAccount.
export function activateAccount(token: string, newPassword: string) {
  return api.post("/auth/activate-account", { token, newPassword });
}
