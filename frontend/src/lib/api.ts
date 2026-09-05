import axios from "axios";

// One shared axios instance for the whole app. Every feature's service
// file (e.g. features/auth/services/auth.service.ts) should import THIS
// instead of creating its own axios instance or calling fetch directly.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // send the auth cookie on every request
});

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

    const niceError = new Error(backendMessage ?? "Something went wrong. Please try again.");
    (niceError as Error & { code?: string }).code = backendCode ?? "UNKNOWN_ERROR";

    return Promise.reject(niceError);
  }
);
