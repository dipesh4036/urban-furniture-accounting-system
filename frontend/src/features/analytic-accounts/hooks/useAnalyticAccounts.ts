import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAnalyticAccount,
  listAnalyticAccounts,
  type CreateAnalyticAccountInput,
  type ListAnalyticAccountsParams,
} from "../services/analytic-accounts.service";

// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params].
const analyticAccountsListKey = (params?: ListAnalyticAccountsParams) =>
  ["analytic-accounts", "list", params ?? {}] as const;

export function useAnalyticAccounts(params?: ListAnalyticAccountsParams) {
  return useQuery({
    queryKey: analyticAccountsListKey(params),
    queryFn: () => listAnalyticAccounts(params),
  });
}

export function useCreateAnalyticAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAnalyticAccountInput) => createAnalyticAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytic-accounts", "list"] });
    },
  });
}
