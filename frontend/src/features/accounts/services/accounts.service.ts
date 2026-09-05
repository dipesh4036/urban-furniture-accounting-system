import { api } from "@/lib/api";

// Matches the Account model in plan.md Module 4.
export type AccountType = "ASSET" | "LIABILITY" | "EXPENSE" | "INCOME" | "CAPITAL";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// List endpoints are paginated by default (backend-express SKILL.md), so
// the list response is the page of accounts plus paging info - not just
// a bare array.
export interface AccountListResult {
  items: Account[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListAccountsParams {
  type?: AccountType;
  page?: number;
  limit?: number;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  isActive?: boolean;
}

// Calls GET /accounts (plan.md Module 4). The backend route doesn't exist
// yet - it's built in this same branch's Backend Commits - so this call
// will 404 until then.
export function listAccounts(params?: ListAccountsParams): Promise<AccountListResult> {
  return api.get("/accounts", { params });
}

// Calls POST /accounts.
export function createAccount(input: CreateAccountInput): Promise<Account> {
  return api.post("/accounts", input);
}

// Calls PATCH /accounts/:id. Used for both editing fields and archiving
// (archiving is just sending { isActive: false }).
export function updateAccount(id: string, input: UpdateAccountInput): Promise<Account> {
  return api.patch(`/accounts/${id}`, input);
}
