import { useQuery } from "@tanstack/react-query";
import { me } from "../services/auth.service";

// Reads the current staff session from GET /auth/me. The access token
// lives in an httpOnly cookie the browser sends automatically, so there's
// nothing to pass in here - if the cookie is missing or expired, the
// request just comes back as an error and `user` stays undefined.
export function useAuth() {
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: me,
    retry: false, // an expired/missing session won't fix itself by retrying
  });

  return {
    user: query.data?.user,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data?.user,
  };
}
