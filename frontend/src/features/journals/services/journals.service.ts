import { api } from "@/lib/api";

// Matches the Journal model in plan.md Module 7.
export type JournalType = "SALES" | "PURCHASE" | "BANK" | "CASH";

export interface Journal {
  id: string;
  name: string;
  type: JournalType;
  defaultAccountId: string;
  createdAt: string;
  updatedAt: string;
}

// List endpoints are paginated by default (backend-express SKILL.md).
// Field naming (`journals`) matches the convention the backend already
// uses for accounts/products.
export interface JournalListResult {
  journals: Journal[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListJournalsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateJournalInput {
  name: string;
  type: JournalType;
  defaultAccountId: string;
}

// Calls GET /journals. No update/archive endpoint here - plan.md Module
// 7 only lists create and list for Journals.
export function listJournals(params?: ListJournalsParams): Promise<JournalListResult> {
  return api.get("/journals", { params });
}

// Calls POST /journals. Backend replies with `data: { journal }` - same
// wrapping convention as accounts/products.
export function createJournal(input: CreateJournalInput): Promise<{ journal: Journal }> {
  return api.post("/journals", input);
}
