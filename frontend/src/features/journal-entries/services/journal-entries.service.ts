import { api } from "@/lib/api";

// One debit/credit line inside a Journal Entry. Matches the JournalItem
// model in plan.md Module 8. Numbers come back as strings because the
// backend stores them as Prisma Decimal.
export interface JournalItem {
  id: string;
  accountId: string;
  debit: string;
  credit: string;
}

export interface JournalEntry {
  id: string;
  journalId: string;
  date: string;
  reference: string;
  items: JournalItem[];
  createdAt: string;
  updatedAt: string;
}

// List endpoints are paginated by default (backend-express SKILL.md).
export interface JournalEntryListResult {
  entries: JournalEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListJournalEntriesParams {
  journalId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CreateJournalItemInput {
  accountId: string;
  debit: number;
  credit: number;
}

export interface CreateJournalEntryInput {
  journalId: string;
  date: string;
  reference: string;
  items: CreateJournalItemInput[];
}

// Calls GET /journal-entries.
export function listJournalEntries(params?: ListJournalEntriesParams): Promise<JournalEntryListResult> {
  return api.get("/journal-entries", { params });
}

// Calls GET /journal-entries/:id.
export function getJournalEntry(id: string): Promise<{ entry: JournalEntry }> {
  return api.get(`/journal-entries/${id}`);
}

// Calls POST /journal-entries. The backend re-checks that total debit
// equals total credit (see journal-entries.validator.ts's refine) - the
// UI also checks this before enabling submit, but the backend is the
// real gate, never just the frontend.
export function createJournalEntry(input: CreateJournalEntryInput): Promise<{ entry: JournalEntry }> {
  return api.post("/journal-entries", input);
}
