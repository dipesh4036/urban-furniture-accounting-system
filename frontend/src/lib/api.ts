import axios from "axios";

// One shared axios instance for the whole app. Every feature's service
// file (e.g. features/auth/services/auth.service.ts) should import THIS
// instead of creating its own axios instance or calling fetch directly.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // send the auth cookie on every request
});

// NEXT_PUBLIC_API_URL is "http://localhost:5000/api/v1" - uploaded files
// (e.g. a Contact's profile image) are served from the backend's origin
// directly, not under /api/v1, so this strips that suffix off.
const API_ORIGIN = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").origin;

// Turns a path the backend returned (e.g. "/uploads/abc123.jpg") into a
// full URL an <img> tag can load. Already-full URLs are returned as-is.
export function toFileUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://") || pathOrUrl.startsWith("data:")) {
    return pathOrUrl;
  }
  return `${API_ORIGIN}${pathOrUrl}`;
}

api.interceptors.response.use(
  // The backend always replies with { success: true, message, data, timestamp }
  // on success. We don't want every service file to keep writing
  // `response.data.data` - so we unwrap it here, once, and just hand back
  // the actual data.
  (response) => {
    return response.data.data;
  },
  // On failure, the backend replies with:
  //   { success: false, message, code, errors, timestamp }
  // We turn that into a normal JS Error, with the backend's message and
  // code attached, so calling code can just do `catch (err) { err.message }`
  // instead of digging into `err.response.data.message` every time.
  (error) => {
    const backendMessage = error.response?.data?.message;
    const backendCode = error.response?.data?.code;

    // A 401 means the session is no longer valid - not just "the token
    // expired naturally", but also "an Admin deactivated this account
    // just now" (see backend/src/middlewares/auth.middleware.ts, which
    // re-checks isActive on every request). Either way, sitting on the
    // current page with a dead session helps no one - send them to
    // login. A hard reload (not router.push) so every cached query and
    // piece of client state resets, not just the ones we remember to
    // clear by hand.
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const isAlreadyOnAuthPage =
        window.location.pathname === "/login" || window.location.pathname === "/portal/login";
      if (!isAlreadyOnAuthPage) {
        const loginPath = window.location.pathname.startsWith("/portal") ? "/portal/login" : "/login";
        window.location.assign(loginPath);
      }
    }

    const backendErrors = error.response?.data?.errors as Record<string, string> | undefined;

    // For a validation failure the top-level message is just "Validation
    // failed" - the useful part is in `errors` ({ field: reason }). Surface
    // the first field reason as the error message so the UI shows something
    // actionable instead of the generic envelope text.
    const firstFieldReason =
      backendErrors && typeof backendErrors === "object"
        ? Object.values(backendErrors).find((reason) => typeof reason === "string" && reason.length > 0)
        : undefined;

    const niceError = new Error(firstFieldReason ?? backendMessage ?? "Something went wrong. Please try again.");
    (niceError as Error & { code?: string }).code = backendCode ?? "UNKNOWN_ERROR";
    (niceError as Error & { errors?: Record<string, string> }).errors = backendErrors;

    return Promise.reject(niceError);
  }
);
