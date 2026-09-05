import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAccount,
  listAccounts,
  updateAccount,
  type CreateAccountInput,
  type ListAccountsParams,
  type UpdateAccountInput,
} from "../services/accounts.service";

// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params], details -> [feature, "detail", id].
// Accounts only ever gets listed (no GET /accounts/:id in plan.md), so
// there's no "detail" key here.
const accountsListKey = (params?: ListAccountsParams) => ["accounts", "list", params ?? {}] as const;

export function useAccounts(params?: ListAccountsParams) {
  return useQuery({
    queryKey: accountsListKey(params),
    queryFn: () => listAccounts(params),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAccountInput) => createAccount(input),
    onSuccess: () => {
      // Refetch every accounts list, no matter what filters/page it was
      // showing - the new account could belong on any of them.
      queryClient.invalidateQueries({ queryKey: ["accounts", "list"] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAccountInput }) => updateAccount(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", "list"] });
    },
  });
}
