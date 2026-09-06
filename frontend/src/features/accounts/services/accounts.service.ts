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
// a bare array. Field is `accounts`, not `items` - matches
// backend/src/controllers/accounts.controller.ts's `data: { accounts, meta }`.
export interface AccountListResult {
  accounts: Account[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListAccountsParams {
  type?: AccountType;
  search?: string;
  status?: "ACTIVE" | "ARCHIVED";
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

// Calls POST /accounts. Backend replies with `data: { account }`, not the
// bare account - see accounts.controller.ts's createAccountController.
export function createAccount(input: CreateAccountInput): Promise<{ account: Account }> {
  return api.post("/accounts", input);
}

// Calls PATCH /accounts/:id. Used for both editing fields and archiving
// (archiving is just sending { isActive: false }). Same `{ account }`
// wrapping as create.
export function updateAccount(id: string, input: UpdateAccountInput): Promise<{ account: Account }> {
  return api.patch(`/accounts/${id}`, input);
}
