"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// One QueryClient per browser session. Created inside useState (not at
// module scope) so each user gets their own client instead of sharing one
// across requests on the server - sharing it would leak one user's cached
// data into another user's response.
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
