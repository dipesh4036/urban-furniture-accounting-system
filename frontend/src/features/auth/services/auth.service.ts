import { api } from "@/lib/api";
import type { LoginFormValues } from "../validators/auth.validator";

// Calls POST /auth/login (plan.md Module 3). The backend route for this
// doesn't exist yet - it's built in this same branch's Backend Commits -
// so this call will 404 until then. api.ts already unwraps the
// { success, data } envelope, so this just returns the data straight.
export function login(values: LoginFormValues) {
  return api.post("/auth/login", values);
}
