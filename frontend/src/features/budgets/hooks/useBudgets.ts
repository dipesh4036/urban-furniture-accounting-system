import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBudget,
  listBudgets,
  updateBudget,
  type CreateBudgetInput,
  type ListBudgetsParams,
  type UpdateBudgetInput,
} from "../services/budgets.service";

// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params].
const budgetsListKey = (params?: ListBudgetsParams) => ["budgets", "list", params ?? {}] as const;

export function useBudgets(params?: ListBudgetsParams) {
  return useQuery({
    queryKey: budgetsListKey(params),
    queryFn: () => listBudgets(params),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBudgetInput) => createBudget(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", "list"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBudgetInput }) => updateBudget(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", "list"] });
    },
  });
}
