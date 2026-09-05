import { api } from "@/lib/api";

// Matches the AnalyticAccount model in plan.md Module 11.
export type AnalyticType = "INCOME" | "EXPENSE";

export interface AnalyticAccount {
  id: string;
  name: string;
  type: AnalyticType;
  createdAt: string;
  updatedAt: string;
}

// List endpoints are paginated by default (backend-express SKILL.md).
// Field naming (`analyticAccounts`) matches the convention the backend
// already uses for accounts/products.
export interface AnalyticAccountListResult {
  analyticAccounts: AnalyticAccount[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListAnalyticAccountsParams {
  search?: string;
  type?: AnalyticType;
  page?: number;
  limit?: number;
}

export interface CreateAnalyticAccountInput {
  name: string;
  type: AnalyticType;
}

// Calls GET /analytic-accounts (plan.md Module 11).
export function listAnalyticAccounts(
  params?: ListAnalyticAccountsParams
): Promise<AnalyticAccountListResult> {
  return api.get("/analytic-accounts", { params });
}

// Calls POST /analytic-accounts. No update/archive endpoint exists yet
// (plan.md Module 11 only lists create + list) - so this is create-only.
export function createAnalyticAccount(
  input: CreateAnalyticAccountInput
): Promise<{ analyticAccount: AnalyticAccount }> {
  return api.post("/analytic-accounts", input);
}
