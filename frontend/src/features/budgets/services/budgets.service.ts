import { api } from "@/lib/api";
import type { AnalyticAccount } from "@/features/analytic-accounts/services/analytic-accounts.service";
import type { StaffRole } from "@/features/users/services/users.service";

// The responsiblePerson shape the backend returns - never passwordHash,
// matches backend/src/services/budgets.service.ts's safeResponsiblePersonSelect.
export interface ResponsiblePerson {
  id: string;
  name: string;
  loginId: string;
  email: string;
  role: StaffRole;
}

// Matches the Budget model in plan.md Module 11, with its two relations
// included (analyticAccount, responsiblePerson) - same include shape as
// backend/src/services/budgets.service.ts.
export interface Budget {
  id: string;
  name: string;
  period: string;
  // A string because the backend stores this as a Prisma Decimal.
  plannedAmount: string;
  analyticAccountId: string;
  analyticAccount: AnalyticAccount;
  responsiblePersonId: string;
  responsiblePerson: ResponsiblePerson;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetListResult {
  budgets: Budget[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListBudgetsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateBudgetInput {
  name: string;
  period: string;
  plannedAmount: number;
  analyticAccountId: string;
  responsiblePersonId: string;
}

export type UpdateBudgetInput = Partial<CreateBudgetInput>;

// Calls GET /budgets (plan.md Module 11).
export function listBudgets(params?: ListBudgetsParams): Promise<BudgetListResult> {
  return api.get("/budgets", { params });
}

// Calls POST /budgets.
export function createBudget(input: CreateBudgetInput): Promise<{ budget: Budget }> {
  return api.post("/budgets", input);
}

// Calls PATCH /budgets/:id - partial update of an existing budget.
export function updateBudget(id: string, input: UpdateBudgetInput): Promise<{ budget: Budget }> {
  return api.patch(`/budgets/${id}`, input);
}
