import { useQuery } from "@tanstack/react-query";
import { getBalanceSheet, getBudgetReport, getProfitLoss } from "../services/reports.service";

// Query key convention from frontend-nextjs SKILL.md, using the actual
// filter values as part of the key - so switching the date/period
// refetches instead of showing stale cached data under the same key.
export function useBalanceSheet(asOf: string) {
  return useQuery({
    queryKey: ["reports", "balance-sheet", asOf],
    queryFn: () => getBalanceSheet(asOf),
    enabled: !!asOf,
  });
}

export function useProfitLoss(from: string, to: string) {
  return useQuery({
    queryKey: ["reports", "profit-loss", from, to],
    queryFn: () => getProfitLoss(from, to),
    enabled: !!from && !!to,
  });
}

export function useBudgetReport(period: string) {
  return useQuery({
    queryKey: ["reports", "budget-report", period],
    queryFn: () => getBudgetReport(period),
    enabled: !!period,
  });
}
